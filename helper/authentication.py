import base64
import io
import random
import re
import sys
import time
import xml.etree.ElementTree as ET

import requests
from builtins import RuntimeError, bytearray, range
from cachelib.simple import SimpleCache
from http.cookiejar import CookieJar
from urllib.error import URLError
from urllib.parse import urlparse
from urllib.request import urlopen, build_opener, HTTPCookieProcessor, Request

from config import config, xml_schema

authXmlManaged = xml_schema["authXmlManaged"]
authXmlFederated = xml_schema["authXmlFederated"]
authXmlFederated2 = xml_schema["authXmlFederated2"]
cache = SimpleCache()


def discover_sts(username):
    request = urlopen("https://login.microsoft.com/GetUserRealm.srf", "login={}&xml=1".format(username).encode('utf-8'))
    resp = ET.parse(request)
    nstype = resp.find("./NameSpaceType")
    if nstype is None:
        raise RuntimeError("Invalid GetUserRealm response - missing namespace type")
    if nstype.text == "Federated":
        stsurl = resp.find("./STSAuthURL")
        if stsurl is None:
            raise RuntimeError("Invalid GetUserRealm response - missing STS URL")
        return stsurl.text
    else:
        return None


def buildAuthXmlManaged(username, password, endpoint):
    return authXmlManaged.format(username, password, endpoint)


def getSecurityTokenManaged(username, password, endpoint):
    authReq = buildAuthXmlManaged(username, password, endpoint)
    try:
        request = urlopen("https://login.microsoftonline.com/extSTS.srf", authReq.encode('utf-8'))
    except URLError:
        raise RuntimeError("Failed to send login request.")

    ns = {"soap": "http://www.w3.org/2003/05/soap-envelope",
          "wssec": "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"}

    authRespTree = ET.parse(request)
    authToken = None
    fault = authRespTree.find(".//soap:Fault", ns)
    if fault is not None:
        reason = fault.find("soap:Reason/soap:Text", ns)
        if reason is not None:
            reason = reason.text
        else:
            reason = "*Unknown reason*"
        raise RuntimeError("Railed to retrieve authentication token: {}".format(reason))

    tokenElm = authRespTree.find(".//wssec:BinarySecurityToken", ns)
    if tokenElm is None:
        raise RuntimeError("Failed to extract authentication token.")
    else:
        authToken = tokenElm.text
    return authToken


def buildAuthXmlFederated(username, password, stsurl):
    timestamp = time.time()
    ctime = time.gmtime(timestamp)
    etime = time.gmtime(timestamp + 1 * 60)
    ctime_str = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", ctime)
    etime_str = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", etime)
    nonce = base64.standard_b64encode(bytearray(random.getrandbits(8) for _ in range(32)))
    return authXmlFederated.format(stsurl, ctime_str, etime_str, username, password, nonce.decode('utf-8'))


def buildAuthXmlFederated2(assertion):
    return authXmlFederated2.format(assertion)


def getSecurityTokenFederated(username, password, endpoint, stsurl):
    authReq = buildAuthXmlFederated(username, password, stsurl)
    try:
        req = Request(stsurl, authReq.encode('utf-8'), {"Content-Type": "application/soap+xml; charset=utf-8"})
        request = urlopen(req)
    except URLError as x:
        raise RuntimeError("Failed to send login request.")

    ns = {"soap": "http://www.w3.org/2003/05/soap-envelope",
          "wssec": "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
          "saml": "urn:oasis:names:tc:SAML:1.0:assertion"}

    # The assertion must be copied into the second request as-is without any processing as it contains a signature.
    text = request.read()
    match = re.search(r"<saml:Assertion .*</saml:Assertion>", text.decode('utf-8'))

    authReq2 = buildAuthXmlFederated2(match.group(0))

    try:
        req = Request("https://login.microsoftonline.com/rst2.srf", authReq2.encode('utf-8'),
                      {"Content-Type": "application/soap+xml; charset=utf-8"})
        request = urlopen(req)
    except URLError as x:
        raise RuntimeError("Failed to send login request.")

    authRespTree = ET.parse(request)
    authToken = None
    fault = authRespTree.find(".//soap:Fault", ns)
    if fault is not None:
        reason = fault.find("soap:Reason/soap:Text", ns)
        if reason is not None:
            reason = reason.text
        else:
            reason = "*Unknown reason*"
        raise RuntimeError("Railed to retrieve authentication token: {}".format(reason))

    tokenElm = authRespTree.find(".//wssec:BinarySecurityToken", ns)
    if tokenElm is None:
        raise RuntimeError("Failed to extract authentication token.")
    else:
        authToken = tokenElm.text
    return authToken


def get_cookies():
    print("Fetching cookies")
    endpoint = config["endpoint"]
    username = config["username"]
    password = config["password"]

    stsurl = discover_sts(username)

    try:
        if stsurl is None:
            authToken = getSecurityTokenManaged(username, password, endpoint)
        else:
            authToken = getSecurityTokenFederated(username, password, endpoint, stsurl)
    except RuntimeError as x:
        print(x, sys.stderr)

    endpointUrl = urlparse(endpoint)
    if endpointUrl.scheme not in ["http", "https"] or not endpointUrl.netloc:
        print("Invalid endpoint URL: {}".format(endpoint))

    cookiejar = CookieJar()
    opener = build_opener(HTTPCookieProcessor(cookiejar))
    try:
        parsed_url = "{0}://{1}/_forms/default.aspx?wa=wsignin1.0".format(
            endpointUrl.scheme, endpointUrl.netloc)
        request = Request(parsed_url)
        response = opener.open(request, data=authToken.encode('utf-8'))
        cookieStr = ""
        cookiesFound = []
        for cookie in cookiejar:
            if cookie.name in ("FedAuth", "rtFa"):
                cookieStr += cookie.name + "=" + cookie.value + "; "
                cookiesFound.append(cookie.name)

        if "FedAuth" not in cookiesFound or "rtFa" not in cookiesFound:
            print("Incomplete cookies retrieved.", sys.stderr)

    except URLError as x:
        print("Failed to login to SharePoint site: {}".format(x.reason))

    return cookieStr


def read_file(url):
    try:
        authCookie = cache.get('authCookie')
        if authCookie is None:
            authCookie = get_cookies()
            print("set the cookies" + authCookie)
            cache.set('authCookie', authCookie, timeout=86400)
        response = requests.get(url, headers={"Cookie": authCookie})
        if response is not None:
            bytes_file_obj = io.BytesIO()
            bytes_file_obj.write(response.content)
            bytes_file_obj.seek(0)  # set file object to start
            return bytes_file_obj
        return None
    except:
        return None
