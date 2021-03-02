import json
import sys

import requests
from flask import render_template
from flask import Response
from config import config
from controller.enrollment import Enrollment
from controller.irb import Irb
from controller.ufirst import Ufirst

ufirst_url = config["ufirst_url"]
irb_url = config["irb_url"]
enrollment_url = config["enrollment_url"]
gtag_id = config['gtag_id']
enrollment_header = json.loads(config["enrollment_header"])
ufirst = Ufirst(ufirst_url)
irb = Irb(irb_url)
enrollment = Enrollment(enrollment_url, enrollment_header, irb_url)


def track_event(category, action, label=None, value=0):
    if gtag_id is not None:
        data = {
            'v': '1',  # API Version.
            'tid': gtag_id,  # Tracking ID / Property ID.
            # Anonymous Client Identifier. Ideally, this should be a UUID that
            # is associated with particular user, device, or browser instance.
            'cid': '555',
            't': 'event',  # Event hit type.
            'ec': category,  # Event category.
            'ea': action,  # Event action.
            'el': label,  # Event label.
            'ev': value,  # Event value, must be an integer
            'ua': 'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14'
        }

        response = requests.post('https://www.google-analytics.com/collect', data=data)

        # If the request fails, this will raise a RequestException. Depending
        # on your application's needs, this may be a non-error and can be caught
        # by the caller.
        print(response.raise_for_status())


def get_home():
    try:
        total_proposals = ufirst.get_count()
        total_irb = irb.get_count()
        total_enrollments = enrollment.get_count()
        track_event(category='home page', action='view')
        return render_template('main.html', total_proposals=total_proposals, total_irb=total_irb,
                               total_enrollments=total_enrollments)
    except:
        print(sys.exc_info())
        return render_template('base.html',
                               message="Something went wrong!! Please report this incident to ocr-apps@ahc.ufl.edu.")


def get_ufirst_data():
    try:
        result, total_proposals, total_direct, total_indirect, grand_total = ufirst.get_data()
        if result is not None:
            track_event(category='ufirst page', action='view')
            return render_template('home.html', result=result, total_proposals=total_proposals,
                                   total_direct=f"{total_direct:,}", total_indirect=f"{total_indirect:,}",
                                   grand_total=f"{grand_total:,}")
        return render_template('base.html',
                               message="Something went wrong!! Please report this incident to ocr-apps@ahc.ufl.edu.")
    except:
        print(sys.exc_info())
        return render_template('base.html',
                               message="Something went wrong!! Please report this incident to ocr-apps@ahc.ufl.edu.")


def get_irb_data():
    try:
        irb = Irb(irb_url)
        result = irb.get_data()
        if result is not None:
            track_event(category='irb page', action='view')
            return render_template('irb.html', result=result)
        return render_template('base.html',
                               message="Something went wrong!! Please report this incident to ocr-apps@ahc.ufl.edu.")
    except:
        print(sys.exc_info())
        return render_template('base.html',
                               message="Something went wrong!! Please report this incident to ocr-apps@ahc.ufl.edu.")


def get_enrollment_data():
    try:
        enrollment = Enrollment(enrollment_url, enrollment_header, irb_url)
        result, total_enrollments, total_protocols = enrollment.get_data()
        if result is not None:
            track_event(category='enrollment page', action='view')
            return render_template('enrollment.html', result=result, total_enrollments=total_enrollments,
                                   total_protocols=total_protocols)
        return render_template('base.html',
                               message="Something went wrong!! Please report this incident to ocr-apps@ahc.ufl.edu.")
    except:
        print(sys.exc_info())
        return render_template('base.html',
                               message="Something went wrong!! Please report this incident to ocr-apps@ahc.ufl.edu.")

def health():
    return Response("Healthy", status=200, mimetype='application/json')