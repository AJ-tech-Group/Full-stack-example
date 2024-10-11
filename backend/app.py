from flask import Flask, request, jsonify, send_file, session
import pandas as pd
from datetime import date

app = Flask(__name__)
app.secret_key = 'Enerlites0522'  # Set the secret key

# User data
users = {'admin': '123',
         'Sharon': 'sharon0001!',
         'Angel': 'angel0010@',
         'Evelyn': 'evelyn0011#',
         'PaulYao': 'paulyao0100$',
         'Debby': 'debby0101%',
         'Keilani': 'keilani0110&'}

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    print(data)
    username = data.get('username')
    password = data.get('password')
    if username in users and users[username] == password:
        session['username'] = username
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid credentials"}), 401


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({"message": "Logout successful"}), 200


@app.route("/products", methods=["GET"])
def get_products():
    PIM_report = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Database\PIM_database.xlsx")
    products = PIM_report.to_dict(orient='records')
    # print("get_product")
    return jsonify(products)

# Define a function to format numbers as currency with a dollar sign
def format_currency(value):
    return "${:,.2f}".format(value)

@app.route("/products", methods=["POST"])
def add_product():
    today = date.today()
    today_date = today.strftime("%m/%d/%Y")

    PIM_report = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Database\PIM_database.xlsx")
    df_map = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Database\Mapping_database.xlsx")

    df_map = df_map[['Enerlites', 'EN SOCal Price']]
    df_map['EN SOCal Price'] = df_map['EN SOCal Price'].apply(lambda x: format_currency(float(x)) if pd.notnull(x) else x)
    df_map = df_map.rename(columns = {'Enerlites': 'EN_Item_No'})

    products = PIM_report.to_dict(orient='records')
    new_product = request.json
    new_product['Mfg_Stocking_Price'] = format_currency(float(new_product['Mfg_Stocking_Price']))
    new_product['Input_Date'] = today_date
    products.append(new_product)
    print(new_product)
    df = pd.DataFrame(products)
    df = df[['Issue_Date', 'EN_Item_No', 'State', 'Mfg_Stocking_Price','Competitor_Item_No', 'Quantity',
                'Manufacturer', 'Distributor', 'Mfg_Decription', 'Distributor_Type', 'Owner', 'Input_Date']]
    df.to_excel(r"I:\Software Engineering\EnerlitesPIM\Database\PIM_database.xlsx", index=False) #Overwrite database 

    df_wPrice = df.merge(df_map, on='EN_Item_No', how='left')
    df_wPrice = df_wPrice[['Issue_Date', 'EN_Item_No', 'State', 'EN SOCal Price', 'Mfg_Stocking_Price','Competitor_Item_No', 'Quantity',
                   'Manufacturer', 'Distributor', 'Mfg_Decription', 'Distributor_Type', 'Owner', 'Input_Date']]
    df_wPrice.to_excel(r"I:\Software Engineering\EnerlitesPIM\Report\PIM_report.xlsx", index=False) #For user download
    # print(df)

    return jsonify(new_product), 201

@app.route('/get_competitors', methods=['GET'])
def get_competitors():
    df = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Database\Mapping_database.xlsx")
    df = df.drop(columns=['Description', 'EN SOCal Price'])
    reference_key = ['Leviton', 'Eaton', 'Legrand', 'Lutron', 'Hubbell',
        'Schneider Electric', 'Arlington / Tork / Lew', 'SensorWorx',
        'Acuity Brand', 'Steinel']
    en_item_no = request.args.get('en_item_no')
    if not en_item_no:
        return jsonify({'error': 'EN_Item_No is required'}), 400
    print(en_item_no)
    reference = df[df['Enerlites'] == en_item_no].values.tolist()[0][1::]
    competitors = []
    for i in range(len(reference_key)):
        competitors.append(f"{reference_key[i]}: {reference[i]}")
    
    return jsonify({'competitors': competitors})


@app.route("/products", methods=["DELETE"])
def delete_product():
    # Receive product information to delete from the request body
    product_info = request.json
    product_info['Mfg_Stocking_Price'] = format_currency(float(product_info['Mfg_Stocking_Price']))

    # Read the PIM database
    df_PIM = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Database\PIM_database.xlsx")
    df_PIM = df_PIM.fillna('NA')

    df_map = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Database\Mapping_database.xlsx")

    df_map = df_map[['Enerlites', 'EN SOCal Price']]
    df_map['EN SOCal Price'] = df_map['EN SOCal Price'].apply(lambda x: format_currency(float(x)) if pd.notnull(x) else x)
    df_map = df_map.rename(columns = {'Enerlites': 'EN_Item_No'})

    product_info = pd.DataFrame([product_info])
    product_info['Mfg_Decription'] = product_info['Mfg_Decription'].replace('','NA')
    if (product_info['Quantity'] == '').any():
        product_info['Quantity'] = product_info['Quantity'].replace('','NA')
    else:
        product_info['Quantity'] = product_info['Quantity'].astype(float)

    product_info = product_info[['Issue_Date', 'EN_Item_No', 'State', 'Mfg_Stocking_Price','Competitor_Item_No', 'Quantity',
            'Manufacturer', 'Distributor', 'Mfg_Decription', 'Distributor_Type', 'Owner']]

    # print(product_info)

    # Ignore 'Input_Date' column in both DataFrames
    df_source_no_input_date = df_PIM.drop(columns=['Input_Date'])

    # Check if each row in df_source_no_input_date matches product_info_df
    mask = (df_source_no_input_date == product_info.squeeze()).all(axis=1)

    df_res = df_PIM[~mask]
    # print(df_res)
    df_res = df_res[['Issue_Date', 'EN_Item_No', 'State', 'Mfg_Stocking_Price','Competitor_Item_No', 'Quantity',
            'Manufacturer', 'Distributor', 'Mfg_Decription', 'Distributor_Type', 'Owner', 'Input_Date']]

    df_res.to_excel(r"I:\Software Engineering\EnerlitesPIM\Database\PIM_database.xlsx", index=False)

    df_wPrice = df_res.merge(df_map, on='EN_Item_No', how='left')
    df_wPrice = df_wPrice[['Issue_Date', 'EN_Item_No', 'State', 'EN SOCal Price', 'Mfg_Stocking_Price','Competitor_Item_No', 'Quantity',
                'Manufacturer', 'Distributor', 'Mfg_Decription', 'Distributor_Type', 'Owner', 'Input_Date']]
    df_wPrice.to_excel(r"I:\Software Engineering\EnerlitesPIM\Report\PIM_report.xlsx", index=False) #For user download 

    return jsonify({"message": "Products deleted successfully"}), 200

@app.route('/download-template')
def download_template():
    # Path to your template file
    template_path = r"I:\Software Engineering\EnerlitesPIM\Template\Import_template.xlsx"
    return send_file(template_path, as_attachment=True)

@app.route('/download-report')
def download_report():
    # Path to your template file
    template_path = rf"I:\Software Engineering\EnerlitesPIM\Report\PIM_report.xlsx"
    return send_file(template_path, as_attachment=True)

def convert_to_float(value):
    try:
        # Check if the value is already a float
        if isinstance(value, float):
            return value
        # Remove the dollar sign and commas, then convert to float
        return float(value.replace('$', '').replace(',', ''))
    except (ValueError, AttributeError):
        # If the conversion fails, return the original value
        return value

@app.route('/upload-file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    df_multi = pd.read_excel(file)
    missing_fields = []

    # Check each column for missing values and collect errors
    if df_multi['Manufacturer'].isna().any():
        missing_fields.append("Manufacturer")
    if df_multi['Distributor'].isna().any():
        missing_fields.append("Distributor")
    if df_multi['State'].isna().any():
        missing_fields.append("State")
    if df_multi['EN_Item_No'].isna().any():
        missing_fields.append("EN_Item_No")
    if df_multi['Competitor_Item_No'].isna().any():
        missing_fields.append("Competitor_Item_No")
    if df_multi['Mfg_Stocking_Price'].isna().any():
        missing_fields.append("Mfg_Stocking_Price")
    if df_multi['Distributor_Type'].isna().any():
        missing_fields.append("Distributor_Type")
    if df_multi['Issue_Date'].isna().any():
        missing_fields.append("Issue_Date")
    if df_multi['Owner'].isna().any():
        missing_fields.append("Owner")
    if df_multi['Input_Date'].isna().any():
        missing_fields.append("Input_Date")

    if missing_fields:
        return jsonify({'error': 'Missing fields', 'fields': missing_fields}), 400

    df_multi['Input_Date'] = pd.to_datetime(df_multi['Input_Date'], format='%m/%d/%Y %I:%M:%S %p')
    df_multi['Input_Date'] = df_multi['Input_Date'].dt.strftime('%m/%d/%Y')

    df_PIM = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Database\PIM_database.xlsx")
    df_map = pd.read_excel(r"I:\Software Engineering\EnerlitesPIM\Database\Mapping_database.xlsx")

    df_map = df_map[['Enerlites', 'EN SOCal Price']]
    df_map['EN SOCal Price'] = df_map['EN SOCal Price'].apply(lambda x: format_currency(float(x)) if pd.notnull(x) else x)
    df_map = df_map.rename(columns={'Enerlites': 'EN_Item_No'})

    df_updated = pd.concat([df_PIM, df_multi], axis=0, ignore_index=True)
    df_updated['Mfg_Stocking_Price'] = df_updated['Mfg_Stocking_Price'].apply(lambda x: format_currency(convert_to_float(x)) if pd.notnull(x) else x)
    df_updated = df_updated[['Issue_Date', 'EN_Item_No', 'State', 'Mfg_Stocking_Price','Competitor_Item_No', 'Quantity',
            'Manufacturer', 'Distributor', 'Mfg_Decription', 'Distributor_Type', 'Owner', 'Input_Date']]
    
    # Convert Issue_Date to datetime
    df_updated['Issue_Date'] = pd.to_datetime(df_updated['Issue_Date'], errors='coerce')

    # Format to YYYY-MM-DD
    df_updated['Issue_Date'] = df_updated['Issue_Date'].dt.strftime('%Y-%m-%d')

    df_updated.to_excel(r"I:\Software Engineering\EnerlitesPIM\Database\PIM_database.xlsx", index=False)

    df_wPrice = df_updated.merge(df_map, on='EN_Item_No', how='left')
    df_wPrice = df_wPrice[['Issue_Date', 'EN_Item_No', 'State', 'EN SOCal Price', 'Mfg_Stocking_Price','Competitor_Item_No', 'Quantity',
                'Manufacturer', 'Distributor', 'Mfg_Decription', 'Distributor_Type', 'Owner', 'Input_Date']]
    
    # Convert Issue_Date to datetime
    df_wPrice['Issue_Date'] = pd.to_datetime(df_wPrice['Issue_Date'], errors='coerce')

    # Format to YYYY-MM-DD
    df_wPrice['Issue_Date'] = df_wPrice['Issue_Date'].dt.strftime('%Y-%m-%d')
    df_wPrice.to_excel(r"I:\Software Engineering\EnerlitesPIM\Report\PIM_report.xlsx", index=False)  # For user download

    return jsonify({'message': 'File uploaded successfully'}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5050, debug=True)

