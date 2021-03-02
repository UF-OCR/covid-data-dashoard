import json
import sys

import pandas as pd
import requests

from helper.authentication import read_file


class Enrollment:
    def __init__(self, url, header, irb_url):
        self.url = url
        self.header = header
        self.irb_url = irb_url

    def get_count(self):
        try:
            total_enrollments = 0
            parse_result = self.api_request()
            parse_result = json.loads(parse_result)
            if parse_result is not None:
                for x in parse_result['covid-protocols']:
                    for key, val in parse_result['covid-protocols'][x].items():
                        if key == "accruals":
                            total_enrollments += val["on_study_count"]
            return total_enrollments
        except:
            print(sys.exc_info())
            return 0

    def api_request(self):
        try:
            response = requests.get(self.url, headers=self.header)
            if response.status_code == 200:
                return json.dumps(response.json())
            else:
                return None
        except:
            print(sys.exc_info())
            return None

    def get_data(self):
        try:
            col = ["Protocol No", "Title", "Phase", "NCT", "Status", "On Study", "ID"]
            result = []
            total_protocols = 0
            total_enrollments = 0
            parse_result = self.api_request()
            if parse_result is not None:
                parse_result = json.loads(parse_result)
                for x in parse_result['covid-protocols']:
                    res = ["" for x in range(7)]
                    for key, val in parse_result['covid-protocols'][x].items():
                        if key == "accruals":
                            # res[5] = val["consented_count"]
                            # res[6] =val["expired_count"]
                            # res[7] =val["not_eligible_count"]
                            # res[8] =val["off_study_count"]
                            res[5] = val["on_study_count"]
                            total_enrollments += res[5]
                            # res[10] =val["off_treatment_count"]
                            # res[11] =val["on_treatment_count"]
                            # res[12] =val["on_follow_up_count"]
                        if key == "protocol_no":
                            if val is not None:
                                total_protocols += 1
                                res[0] = val
                        if key == "title":
                            if val is not None:
                                res[1] = val
                        if key == "nct_number":
                            if val is not None:
                                res[3] = "https://clinicaltrials.gov/ct2/show/" + val
                        if key == "phase":
                            if val is not None:
                                res[2] = val
                        if key == "status":
                            if val is not None:
                                res[4] = val
                        if key == "irb_no":
                            if val is not None:
                                res[6] = val
                    result.append(res)
                data = read_file(self.irb_url)
                if data is not None:
                    df1 = pd.read_excel(data, engine='openpyxl')
                    if df1 is not None:
                        df1['Reporting Category'] = df1['Reporting Category'].fillna("")
                        df1 = df1[['ID', 'Reporting Category']]
                        df1 = df1.fillna("")
                        df2 = pd.DataFrame(data=result, columns=col)
                        df = pd.merge(df1, df2, how='right', on=['ID'])
                        df['Reporting Category'] = df['Reporting Category'].fillna("Unassigned")
                        df = df.fillna("")
                        df['On Study'] = df['On Study'].replace("", 0)
                        return df.to_numpy().tolist(), total_enrollments, total_protocols
            return None, None, None
        except:
            print(sys.exc_info())
            return None, None, None
