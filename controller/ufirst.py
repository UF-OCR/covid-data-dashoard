import sys

import pandas as pd

from helper.authentication import read_file


class Ufirst:
    def __init__(self, url):
        self.url = url

    def get_count(self):
        try:
            data = read_file(self.url)
            total_proposals = 0
            if data is not None:
                df = pd.read_excel(data)
                remove_index = df[df['Reporting Category'] == 'IGNORE'].index
                if len(remove_index):
                    df.drop(df.index[remove_index], inplace=True)
                total_proposals = len(df["CLK_PROPOSAL_ID"].index)
            return total_proposals
        except:
            print(sys.exc_info())
            return 0

    def get_data(self):
        try:
            data = read_file(self.url)
            if data is not None:
                df = pd.read_excel(data)
                df['CLK_TOTAL_DIRECT_COSTS'] = df['CLK_TOTAL_DIRECT_COSTS'].fillna(0)
                df['CLK_TOTAL_INDIRECT_COSTS'] = df['CLK_TOTAL_INDIRECT_COSTS'].fillna(0)
                df['CLK_GRAND_TOTAL'] = df['CLK_GRAND_TOTAL'].fillna(0)
                df['Reporting Category'] = df['Reporting Category'].fillna("Unassigned")
                status_mapping = {"Awarded": "3-Awarded",
                                  "Pending Sponsor Review": "2-Pending",
                                  "Not Funded": "4-Not Funded",
                                  "Terminated": "5-Inactive",
                                  "Draft": "1-Pre Submission",
                                  "Core Office Review": "1-Pre Submission",
                                  "Withdrawn": "5-Inactive",
                                  "Award Pending": "2-Pending",
                                  "Core Office Review Post Submission Updates": "1-Pre Submission",
                                  "Undergoing budget revisions": "1-Pre Submission",
                                  "Pending Proposal Team Response: Dept Review": "2-Pending",
                                  "Department Review": "1-Pre Submission"}
                df['CLK_CURRENTSTATE'] = df['CLK_CURRENTSTATE'].map(status_mapping)
                df['CLK_CURRENTSTATE'] = df['CLK_CURRENTSTATE'].fillna("6-Unmapped")
                df = df.fillna("")
                remove_index = df[df['Reporting Category']=='IGNORE'].index
                if len(remove_index):
                    df.drop(df.index[remove_index], inplace=True)
                total_proposals = len(df["CLK_PROPOSAL_ID"].index)
                total_direct = df['CLK_TOTAL_DIRECT_COSTS'].sum()
                total_indirect = df['CLK_TOTAL_INDIRECT_COSTS'].sum()
                grand_total = df['CLK_GRAND_TOTAL'].sum()
                result_group = ['CLK_PROPOSAL_ID', 'CLK_CURRENTSTATE', 'Reporting Category', 'CLK_TITLE', 'CLK_PI_NAME',
                                'CLK_PI_HOME_DEPT', 'CLK_SPONSOR_NAME', 'CLK_TOTAL_DIRECT_COSTS',
                                'CLK_TOTAL_INDIRECT_COSTS', 'CLK_GRAND_TOTAL']
                result = df[result_group].to_numpy().tolist()

                return result, total_proposals, total_direct, total_indirect, grand_total
            return None, None, None, None, None
        except:
            print(sys.exc_info())
            return None, None, None, None, None
