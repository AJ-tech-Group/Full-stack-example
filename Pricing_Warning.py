import pandas as pd
import smtplib
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import schedule
import time

def pricing_warning():
    # Read the Excel file
    df = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Report\PIM_report.xlsx")
    receiver = "sharon@enerlites.com"

    # Calculate the date three months ago from today
    three_months_ago = datetime.now() - relativedelta(months=3)

    # Convert 'Input_Date' column to datetime objects
    df['Input_Date'] = pd.to_datetime(df['Input_Date'])

    # Filter rows where Input_Date is within the past three months
    df = df[df['Input_Date'] >= three_months_ago]

    df['Input_Date'] = pd.to_datetime(df['Input_Date'], format='%m/%d/%Y %I:%M:%S %p')
    df['Input_Date'] = df['Input_Date'].dt.strftime('%m/%d/%Y')

    # Remove non-numeric characters from the target columns
    df['Mfg_Stocking_Price'] = df['Mfg_Stocking_Price'].str.replace('$', '', regex=False)
    df['EN SOCal Price'] = df['EN SOCal Price'].str.replace('$', '', regex=False)

    # Convert the columns to float
    df['Mfg_Stocking_Price'] = df['Mfg_Stocking_Price'].astype(float)
    df['EN SOCal Price'] = df['EN SOCal Price'].astype(float)

    # Create dataframes based on the conditions
    df_greater30 = df[df['Mfg_Stocking_Price'] > df['EN SOCal Price']*1.3].copy()
    df_less20 = df[df['Mfg_Stocking_Price'] < df['EN SOCal Price']*0.8].copy()

    # Define a function to format numbers as currency with a dollar sign
    def format_currency(value):
        return "${:,.2f}".format(value)
    def highlight_column(x):
        df = x.copy()
        df.loc[:, :] = ''  # reset all cells to empty string
        df['Mfg_Stocking_Price'] = 'background-color: yellow'
        return df

    df_greater30.loc[:,'Mfg_Stocking_Price'] = df_greater30['Mfg_Stocking_Price'].apply(lambda x: format_currency(float(x)) if pd.notnull(x) else x)
    df_greater30.loc[:,'EN SOCal Price'] = df_greater30['EN SOCal Price'].apply(lambda x: format_currency(float(x)) if pd.notnull(x) else x)

    df_less20.loc[:,'Mfg_Stocking_Price'] = df_less20['Mfg_Stocking_Price'].apply(lambda x: format_currency(float(x)) if pd.notnull(x) else x)
    df_less20.loc[:,'EN SOCal Price'] = df_less20['EN SOCal Price'].apply(lambda x: format_currency(float(x)) if pd.notnull(x) else x)

    df_less20 = df_less20.drop(columns=['Mfg_Decription', 'Quantity'])
    df_greater30 = df_greater30.drop(columns=['Mfg_Decription', 'Quantity'])

    if not df_less20.empty:
        #Warning for pricing less than 20%
        info = "Enerlites PIM has found the competitor's pricing is less than 20% of the company's pricing. Please see details below:"
        # Apply the highlight function to the DataFrame
        df_less20_styled = df_less20.reset_index(drop=True).style.apply(highlight_column, axis=None) \
            .set_table_styles([
                {'selector': 'th',  # Styling for table headers
                'props': [('border', '1px solid black'),
                            ('background-color', 'lightgray'),
                            ('text-align', 'center'),
                            ('font-weight', 'bold')]},
                {'selector': 'td',  # Styling for table cells
                'props': [('border', '1px solid black'),
                            ('text-align', 'center')]},
                {'selector': '.row_hover:hover',  # Styling for row hover effect
                'props': [('background-color', 'lightblue')]},
            ])

        # Convert the styled DataFrame to HTML
        body = df_less20_styled.to_html(index=False)

        today = date.today()
        today_date = today.strftime("%m/%d/%Y")

        # Email configuration
        email = "EnerlitesPIM@gmail.com"
        receiver_email = receiver
        subject = f"Enerlites Competitor Pricing Warning (20% Less) {today_date}"

        # Create the MIME message
        msg = MIMEMultipart()
        msg['From'] = email
        msg['To'] = receiver_email
        msg['Subject'] = subject

        # Attach the HTML body to the email
        html_body = f"<p>{info}</p>{body}"
        msg.attach(MIMEText(html_body, 'html'))

        # Send the email
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(email, "lxbr vedl kwhq pdga")
        server.sendmail(email, receiver_email, msg.as_string())

        print("Less 20% warning email has been sent to " + receiver_email)

    if not df_greater30.empty:
        #Warning for pricing greater than 30%
        info = "Enerlites PIM has found the competitor's pricing is greater than 30% of the company's pricing. Please see details below:"
        # Apply the highlight function to the DataFrame
        df_greater30_styled = df_greater30.reset_index(drop=True).style.apply(highlight_column, axis=None) \
            .set_table_styles([
                {'selector': 'th',  # Styling for table headers
                'props': [('border', '1px solid black'),
                            ('background-color', 'lightgray'),
                            ('text-align', 'center'),
                            ('font-weight', 'bold')]},
                {'selector': 'td',  # Styling for table cells
                'props': [('border', '1px solid black'),
                            ('text-align', 'center')]},
                {'selector': '.row_hover:hover',  # Styling for row hover effect
                'props': [('background-color', 'lightblue')]},
            ])
        # Convert df_greater30 to an HTML string
        body = df_greater30_styled.to_html(index=False)

        today = date.today()
        today_date = today.strftime("%m/%d/%Y")

        # Email configuration
        email = "EnerlitesPIM@gmail.com"
        receiver_email = receiver
        subject = f"Enerlites Competitor Pricing Warning (30% greater) {today_date}"

        # Create the MIME message
        msg = MIMEMultipart()
        msg['From'] = email
        msg['To'] = receiver_email
        msg['Subject'] = subject

        # Attach the HTML body to the email
        html_body = f"<p>{info}</p>{body}"
        msg.attach(MIMEText(html_body, 'html'))

        # Send the email
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(email, "lxbr vedl kwhq pdga")
        server.sendmail(email, receiver_email, msg.as_string())

        print("Greate 30% email has been sent to " + receiver_email)

# Function to schedule pricing_warning on the 1st of every month
def schedule_monthly_task():
    today = datetime.now().day
    if today == 1:
        schedule.every().day.at("07:30").do(pricing_warning)

# Initial scheduling to start the monthly task
schedule_monthly_task()

while True:
    schedule.run_pending()
    time.sleep(1)