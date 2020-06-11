import sys

import pandas as pd

from helper.authentication import read_file


class Irb:
    def __init__(self, url):
        self.url = url

    def get_count(self):
        try:
            data = read_file(self.url)
            total_irb = 0
            if data is not None:
                df = pd.read_excel(data)
                df['Date Submitted Month'] = pd.DatetimeIndex(df['Date Submitted']).month
                df['Date Submitted Year'] = pd.DatetimeIndex(df['Date Submitted']).year
                df['Date Submitted Month'] = df['Date Submitted Month'].fillna(0)
                df['Date Submitted Year'] = df['Date Submitted Year'].fillna(20200)
                remove_index = df[df['Date Submitted Year'] < 2020].index
                if len(remove_index):
                    df.drop(df.index[remove_index], inplace=True)
                total_irb = len(df["ID"].index)
            return total_irb
        except:
            print(sys.exc_info())
            return 0

    def get_data(self):
        try:
            data = read_file(self.url)
            if data is not None:
                df = pd.read_excel(data)
                df['Reporting Category'] = df['Reporting Category'].fillna("Unassigned")
                df['Review Type'] = df['Review Type'].fillna("Unassigned")
                df = df.fillna("")

                status_mapping = {
                    "Withdrawn": "Inactive",
                    "Pre Submission": "Pre Submission",
                    "IRB Staff Review": "In Review",
                    "IRB Assignment": "In Review",
                    "In Expedited Review": "In Review",
                    "In Exempt Review": "In Review",
                    "In Ceded Review": "In Review",
                    "Changes Requested By IRB Staff": "In Review",
                    "Changes Requested by Expedited Reviewer": "In Review",
                    "Changes Requested by Exempt Reviewer": "In Review",
                    "Exempt Approved": "Approved",
                    "Approved": "Approved",
                    "Template": "Pre Submission",
                    "In Exempt Review IRB Staff Action Required": "In Review",
                    "Contingencies Pending": "In Review",
                    "Awaiting Site Materials": "Pre Submission"
                }

                df['Current Status'] = df['Current Status'].map(status_mapping)
                df['Current Status'] = df['Current Status'].fillna("Unmapped")
                df['Date Submitted Month'] = pd.DatetimeIndex(df['Date Submitted']).month
                df['Date Submitted Year'] = pd.DatetimeIndex(df['Date Submitted']).year
                df['Date Submitted Month'] = df['Date Submitted Month'].fillna(0)
                df['Date Submitted Year'] = df['Date Submitted Year'].fillna(20200)
                remove_index = df[df['Date Submitted Year'] < 2020].index
                if len(remove_index):
                    df.drop(df.index[remove_index], inplace=True)
                df['Date Submitted Year'] = df['Date Submitted Year'].replace(20200, 0)
                df["PI"] = df["PI First Name"] + " " + df["PI Last Name"]
                df = df.fillna("")

                result_group = df[
                    ['ID', 'Committee', 'Current Status', 'Reporting Category', 'Review Type', 'PI',
                     'Date Submitted Month',
                     'Date Submitted Year']]
                result = [
                    ["ID", "IRB COMMITTEE", "STATUS", "REPORTING CATEGORY", "REVIEW TYPE", "IRB SUBMISSIONS MONTH",
                     "IRB SUBMISSIONS YEAR"]]
                add_list = result_group.to_numpy().tolist()
                for j in add_list:
                    result.append(j)
                return result
            return None
        except:
            print(sys.exc_info())
            return None
