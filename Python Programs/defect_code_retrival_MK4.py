import json
import os

import pandas as pd
import pyodbc
import requests, time
from datetime import date
import csv_logs


class start_seq:

    def __init__(self, config_file):
        self.config_file_path = config_file
        self.csv_file_name = 'defect_code_data.csv'
        self.ftt_file_name = 'ftt_data.csv'
        self.token = ''
        self.config_data = json.loads(open(self.config_file_path).read())
        self.logger = csv_logs.start_logging('ScadaDataRetrival', os.getcwd())
        try:
            self.logger.datalog('defect_code', 'Step1', 'Program started')
            self.execution_date = str(date.today()) if self.config_data['Date'] == '-' else self.config_data['Date']
            try:
                self.read_data_from_scada()
            except Exception as e:
                print(f"Error in read_data _from _scada >> {e}")
            try:
                self.read_data_for_ftt()
            except Exception as e:
                print(f"Error in read__data_FTT  >> {e}")


        except Exception as e:
            print(e)

    def generate_token(self):
        x = requests.post(self.config_data['TOKEN_URL'])
        self.logger.datalog('defect_code', 'Step5',
                            f"-token generation - status code {x.status_code} and url |{self.config_data['TOKEN_URL']}|")
        self.token = x.json()
        if x.status_code == 200:
            return x.json()
        else:
            return 'token_exception'

    def send_data(self, file_path, usecase):
        with open(file_path, 'r') as file: csv_string_data = file.read()
        bearer_token = self.token + self.config_data['token_tail']
        headers = {'Authorization': f'Bearer {bearer_token}'}
        url = self.config_data['API_URL'] + str(usecase)
        print(url)
        x = requests.post(url, headers=headers, data=csv_string_data)

        if x.status_code == 401:
            self.token = self.generate_token()
            bearer_token = self.token + self.config_data['token_tail']
            headers = {'Authorization': f'Bearer {bearer_token}'}

            url = self.config_data['API_URL'] + str(usecase)

            z = requests.post(url, headers=headers, data=csv_string_data)
            self.logger.datalog(usecase, 'Step5',
                                f"-data posting to url - status code {z.status_code} and url |{self.config_data['API_URL']}|")
            return z.status_code

    def read_data_from_scada(self):
        conn_str = (
            r'DRIVER={SQL Server};'
            rf'SERVER={self.config_data['server']};'
            rf'DATABASE={self.config_data["database"]};'
            rf'UID={self.config_data["username"]};'
            rf'PWD={self.config_data["password"]};'
        )
        conn = pyodbc.connect(conn_str)
        print(f"{self.config_data['server']} connected for usecase SCADA_Fault_code")
        self.logger.datalog('defect_code', 'Step2', f"scada database connected-{self.config_data['server']}")
        main_df = pd.DataFrame()
        machine = ''
        # query = f'SELECT TOP (100) [{machine}_TDL_GENERATED_DATE] as Time_stamp,[{machine}_WORKPIECE_CARRIER_NUMBER] as Pallet_id,[MODEL_ID] as Comp_Id, [{machine}_FAULT_CODE] as Fault_Id,[{machine}_FAULT_DESCRIPTION] as Fault_desc , [{machine}_MODEL_NAME] as Variant FROM[IGSA].[dbo].[MASTER_TABLE] order by[{machine}_TDL_GENERATED_DATE]  desc'

        print(f' ####  starting to fetch data from scada for date {self.execution_date}   #####')
        for machine, id in self.config_data['Machine_details'].items():
            try:
                print(f"starting Fetching data from {machine}")
                query = f"exec [pallet_wise_rej_python] '{self.execution_date}','{machine}'"
                cursor = conn.cursor()
                cursor.execute(query)
                rows = cursor.fetchall()
                columns = [column[0] for column in cursor.description]  # Get column names from the cursor description
                df = pd.DataFrame.from_records(rows, columns=columns)
                df['Station'] = id
                df['Company_code'] = self.config_data['Company_code']
                df['Plant_code'] = self.config_data['Plant_code']
                df['Line_code'] = self.config_data['Line_code']
                main_df = pd.concat([main_df, df], ignore_index=True)
                print(f'data fetching completed for machine {machine} with records {df.shape[0]}')
                self.logger.datalog('defect_code', 'Step3', f"data fetched from {machine} with records {df.shape[0]}")

            except Exception as e:
                print(f"Error for machine {machine}")
                self.logger.datalog('defect_code', 'Step3', f"error fetched from {machine}")
                print(e)

        main_df = main_df.reindex(columns=['Time_stamp', 'Pallet_id', 'Comp_Id', 'Station', 'Date',
                                           'Shift_id', 'Fault_Id', 'Fault_desc',
                                           'Company_code', 'Plant_code', 'Line_code', 'Variant'])
        main_df.columns = range(main_df.shape[1])
        conn.close()
        main_df.to_csv(self.csv_file_name, index=False, header=False)
        self.logger.datalog('defect_code', 'Step4', f"data wriiten to csv sucessfull - {self.csv_file_name}")
        status = self.send_data(self.csv_file_name, self.config_data['fault_code'])
        if status == 200:
            print("data posting completed")
            for i in range(10):
                print(f'This prompt will close in {10 - i} secs')
                time.sleep(1)
        else:
            print(f"error with status: {status}")
            for i in range(10):
                print(f'This prompt will close in {10 - i} secs')
                time.sleep(1)

    def read_data_for_ftt(self):
        pass
        # db connection
        conn_str = (
            r'DRIVER={SQL Server};'
            rf'SERVER={self.config_data['server']};'
            rf'DATABASE={self.config_data["database"]};'
            rf'UID={self.config_data["username"]};'
            rf'PWD={self.config_data["password"]};'
        )
        conn = pyodbc.connect(conn_str)
        print(f"{self.config_data['server']} connected for usecase FTT")
        self.logger.datalog('FTT', 'Step2', f"scada database connected-{self.config_data['server']}")
        main_df_ftt = pd.DataFrame()
        # run sp
        print(f' ####  starting to fetch data from scada for FTT date {self.execution_date}   #####')
        for machine, id in self.config_data['Machine_details'].items():
            try:
                print(f"FTT: starting Fetching data from {machine}")
                query = f"exec [FTT_python] '{self.execution_date}','{machine}'"
                cursor = conn.cursor()
                cursor.execute(query)
                rows = cursor.fetchall()
                columns = [column[0] for column in cursor.description]  # Get column names from the cursor description
                df = pd.DataFrame.from_records(rows, columns=columns)
                df['Station'] = id
                df['Company_code'] = self.config_data['Company_code']
                df['Plant_code'] = self.config_data['Plant_code']
                df['Line_code'] = self.config_data['Line_code']
                main_df_ftt = pd.concat([main_df_ftt, df], ignore_index=True)
                print(f'FTT :data fetching completed for machine {machine} with records {df.shape[0]}')
                self.logger.datalog('FTT', 'Step3', f"data fetched from {machine} with records {df.shape[0]}")

            except Exception as e:
                print(f"Error for machine {machine}")
                self.logger.datalog('FTT', 'Step3', f"error fetched from {machine}")
                print(e)

        main_df_ftt = main_df_ftt.reindex(columns=['Time_stamp', 'Station', 'Date',
                                                   'Fault_Id',
                                                   'Company_code', 'Plant_code', 'Line_code'])
        main_df_ftt.columns = range(main_df_ftt.shape[1])
        print(main_df_ftt)
        main_df_ftt.to_csv(self.ftt_file_name, index=False, header=False)
        conn.close()
        self.logger.datalog('FTT', 'Step4', f"data wriiten to csv sucessfull - {self.ftt_file_name}")
        status = self.send_data(self.ftt_file_name, self.config_data['ftt'])
        if status == 200:
            print("data posting completed")
            for i in range(10):
                print(f'This prompt will close in {10 - i} secs')
                time.sleep(1)
        else:
            print(f"error with status: {status}")
            for i in range(10):
                print(f'This prompt will close in {10 - i} secs')
                time.sleep(1)


if __name__ == '__main__':
    start_seq('config.json')
