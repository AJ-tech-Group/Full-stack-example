import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogPanel, Button } from '@headlessui/react';
import {} from "stylis-plugin-rtl"
import axios from 'axios';


const PIM = () => {
  const [products, setProducts] = useState([]);
  const [Manufacturer, setManufacture] = useState('');
  const [Distributor, setDistributor] = useState('');
  const [State, setState] = useState('');
  const [EN_Item_No, setEN_Item_No] = useState('');
  const [Competitor_Item_No, setCompetitor_Item_No] = useState('');
  const [Mfg_Decription, setMfg_Decription] = useState('');
  const [Quantity, setQuantity] = useState('');
  const [Mfg_Stocking_Price, setMfg_Stocking_Price] = useState('');
  const [Distributor_Type, setDistributorType] = useState(''); // State for Distributor Type
  const [Issue_Date, setIssueDate] = useState('');
  const [Owner, setOwner] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPosition] = useState({ top: '50%', left: '50%' });
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState(null);
  const [imported, setImported] = useState(false);
  const [competitorOptions, setCompetitorOptions] = useState([]);
  const [customCompetitor, setCustomCompetitor] = useState('');
  const [importAttempted, setImportAttempted] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/products', {method: 'GET'});
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addProduct = async () => {
    if (!Manufacturer || !Distributor || !State || !EN_Item_No || (!Competitor_Item_No && !customCompetitor) || !Mfg_Stocking_Price || !Distributor_Type || !Issue_Date || !Owner) {
      setErrorMessage('Please fill in all required fields!');
      return;
    }
    const finalCompetitorItemNo = Competitor_Item_No === 'Other' ? customCompetitor : Competitor_Item_No;
    const newProduct = { Manufacturer, Distributor, State, EN_Item_No, Competitor_Item_No: finalCompetitorItemNo, Mfg_Decription: Mfg_Decription || '', Quantity, Mfg_Stocking_Price, Distributor_Type, Issue_Date, Owner};

    try {
      const response = await fetch('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      setProducts([...products, newProduct]);
      setManufacture('');
      setDistributor('');
      setState('');
      setEN_Item_No('');
      setCompetitor_Item_No('');
      setMfg_Decription('');
      setQuantity('');
      setMfg_Stocking_Price('');
      setDistributorType(''); // Reset Distributor_Type State
      setIssueDate('');
      setOwner('');
      setErrorMessage('');


    } catch (error) {
      console.error('Error adding product:', error);
    }
    handleDialogClose();
  };

  useEffect(() => {
    if (EN_Item_No) {
      // Fetch competitor item numbers when EN_Item_No changes
      const encodedENItemNo = encodeURIComponent(EN_Item_No);
      axios.get(`/get_competitors?en_item_no=${encodedENItemNo}`)
        .then(response => {
          setCompetitorOptions(response.data.competitors);
          setCompetitor_Item_No(''); // Reset the competitor item number
        })
        .catch(error => {
          console.error('Error fetching competitor item numbers:', error);
        });
    }
  }, [EN_Item_No]);


  const deleteProduct = async (productInfo) => {
    try {
      console.log('Sending product info:', productInfo); // Debug: Log the product info being sent
      const response = await fetch('/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productInfo),
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      // Update products state after successful deletion
      const updatedProducts = products.filter(product => (
        product.Manufacturer !== productInfo.Manufacturer ||
        product.Distributor !== productInfo.Distributor ||
        product.State !== productInfo.State ||
        product.EN_Item_No !== productInfo.EN_Item_No ||
        product.Competitor_Item_No !== productInfo.Competitor_Item_No ||
        product.Mfg_Decription !== productInfo.Mfg_Decription ||
        product.Quantity !== productInfo.Quantity ||
        product.Mfg_Stocking_Price !== productInfo.Mfg_Stocking_Price ||
        product.Distributor_Type !== productInfo.Distributor_Type ||
        product.Issue_Date !== productInfo.Issue_Date ||
        product.Owner !== productInfo.Owner
      ));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };
  

  function handleDownloadTemplate() {
    // Make a GET request to the Flask endpoint
    fetch('/download-template')
        .then(response => {
            // Check if response is successful
            if (!response.ok) {
                throw new Error('Failed to download template');
            }
            // Return blob
            return response.blob();
        })
        .then(blob => {
            // Create URL for the blob
            const url = window.URL.createObjectURL(blob);
            // Create anchor element
            const a = document.createElement('a');
            // Set href attribute to URL
            a.href = url;
            // Set download attribute to specify the filename
            a.download = 'Import_template.xlsx';
            // Append anchor to the body
            document.body.appendChild(a);
            // Click the anchor to trigger download
            a.click();
            // Remove anchor from the body
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Error downloading template:', error);
        });
  }

  function handleDownloadReport() {
    // Get the current date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${month}${day}${year}`;

    // Make a GET request to the Flask endpoint
    fetch('/download-report')
        .then(response => {
            // Check if response is successful
            if (!response.ok) {
                throw new Error('Failed to download template');
            }
            // Return blob
            return response.blob();
        })
        .then(blob => {
            // Create URL for the blob
            const url = window.URL.createObjectURL(blob);
            // Create anchor element
            const a = document.createElement('a');
            // Set href attribute to URL
            a.href = url;
            const filename = `PIM_report_${formattedDate}.xlsx`;
            // Set download attribute to specify the filename
            a.download = filename;
            // Append anchor to the body
            document.body.appendChild(a);
            // Click the anchor to trigger download
            a.click();
            // Remove anchor from the body
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Error downloading template:', error);
        });
  }


  function handleDialogOpen() {
    setIsDialogOpen(true)
  }

  function handleDialogClose() {
    setIsDialogOpen(false);
    setErrorMessage('');
  }


  
  const handleFileChange = (event) => {
      setFile(event.target.files[0]);
      // setImported(false); // Reset import status when file changes
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setImportAttempted(true);

    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload-file', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          if (data.error === 'Missing fields') {
            setMissingFields(data.fields); // Set missing fields received from backend
          }
          throw new Error('Failed to upload file');
        });
      }
      setImported(true); // Set imported status to true upon successful submission
      // Handle successful upload
    })
    .catch(error => {
      console.error('Error uploading file:', error);
      setImported(false);
    });
  };

  
  const buttonStyle = {
    backgroundColor: 'rgba(61, 17, 82, 1)',
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
  }
  const buttonStyle2 = {
    backgroundColor: 'rgba(61, 17, 82, 1)',
    color: 'white',
    padding: '10px 20px',
    fontSize: '12px',
    // border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    // width: '100%',
  }

  const buttonStyle3 = {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    color: 'white',
    padding: '5px 5px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '-20px'
    // width: '100%',
    // float: 'right',
  }
  const buttonReturn = {
    backgroundColor: 'rgba(64, 64, 64, 0.9)',
    color: 'white',
    padding: '5px 5px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '4.5%',
    float: 'right',
    marginTop: '-20px'
  }

  const dialogStyle = {
    position: 'absolute',
    top: dialogPosition.top,
    left: dialogPosition.left,
    transform: 'translate(-50%, -20%)',
    backgroundColor: 'rgba(64, 64, 64, 0.9)',
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '890px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Enerlites PIM System</h1>
      <button type="button" style={{ float: 'right', marginTop: '-25px' }} onClick={handleDownloadReport}>
              Download PIM Report
      </button>
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', marginBottom: '15px' }}>
          <div style={{ marginRight: '10px', flex: '2' }}>
            <label htmlFor="Manufacturer" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Manufacturer  <span style={{ color: 'red' }}>*</span> </label>
              <input
                type="text"
                id="Manufacturer"
                value={Manufacturer}
                onChange={(e) => setManufacture(e.target.value)}
                placeholder="Enter Manufacturer name"
                style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
                required
            />
          </div>
          <div style={{ marginRight: '10px', flex: '2' }}>
            <label htmlFor="Distributor" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Distributor/Vendor <span style={{ color: 'red' }}>*</span> </label>
            <input
              type="text"
              id="Distributor"
              value={Distributor}
              onChange={(e) => setDistributor(e.target.value)}
              placeholder="Enter Distributor name"
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ flex: '1' }}>
            <label htmlFor="State" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>State <span style={{ color: 'red' }}>*</span> </label>
            <input
              type="text"
              id="State"
              value={State}
              onChange={(e) => setState(e.target.value)}
              placeholder="Enter State"
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
              required
            />
          </div>
        </div>
        <div style={{ display: 'flex', marginBottom: '15px' }}>
          <div style={{ marginRight: '10px', flex: '1' }}> 
            <label htmlFor="EN_Item_No" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>EN Item No <span style={{ color: 'red' }}>*</span> </label>
            <input
              type="text"
              id="EN_Item_No"
              value={EN_Item_No}
              onChange={(e) => setEN_Item_No(e.target.value)}
              placeholder="Enter Item Number"
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginRight: '10px', flex: '1' }}> 
            <label htmlFor="Competitor_Item_No" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Competitor Item No <span style={{ color: 'red' }}>*</span> </label>
            <select
              type="text"
              id="Competitor_Item_No"
              value={Competitor_Item_No}
              onChange={(e) => {
                setCompetitor_Item_No(e.target.value)
              }}
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
              required
            >
              <option value="" disabled>Select Competitor Item No</option>
              {competitorOptions.map((competitor) => (
                <option key={competitor} value={competitor}>{competitor}</option>
              ))}
              <option value="Other">Other</option>
            </select>  
            {Competitor_Item_No === 'Other' && (
              <input
                type="text"
                value={customCompetitor.startsWith(Manufacturer) ? customCompetitor : `${Manufacturer}: `}
                onChange={(e) => setCustomCompetitor(e.target.value)}
                placeholder="Enter custom item number"
                style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box', marginTop: '10px' }}
                required
              />
            )}
          </div>
          <div style={{ flex: '1' }}>
            <label htmlFor="Mfg_Decription" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Mfg Decription</label>
            <input
              type="text"
              id="Mfg_Decription"
              value={Mfg_Decription}
              onChange={(e) => setMfg_Decription(e.target.value)}
              placeholder="Enter Decription"
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}

            />
          </div>
        </div>
        <div style={{ display: 'flex', marginBottom: '15px' }}>
          <div style={{ marginRight: '10px', flex: '1' }}>
            <label htmlFor="Quantity" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Quantity</label>
            <input
              type="number"
              id="Quantity"
              value={Quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter Quantity"
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}

            />
          </div>
          <div style={{ marginRight: '10px', flex: '1' }}>
            <label htmlFor="Mfg_Stocking_Price" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Mfg Stocking Price <span style={{ color: 'red' }}>*</span> </label>
            <input
              type="number"
              id="Mfg_Stocking_Price"
              value={Mfg_Stocking_Price}
              onChange={(e) => setMfg_Stocking_Price(e.target.value)}
              placeholder="Enter unit price"
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginRight: '10px', flex: '1' }}>
            <label htmlFor="DistributorType" style={{ display: 'block', marginBottom: '10px', color: '#333' }}>Distributor Type <span style={{ color: 'red' }}>*</span> </label>
            <div>
              <label htmlFor="stockingRadio" style={{ marginRight: '2px' }}>
                <input
                  type="radio"
                  id="stockingRadio"
                  name="Distributor_Type"
                  value="Stocking"
                  checked={Distributor_Type === 'Stocking'}
                  onChange={(e) => setDistributorType(e.target.value)}
                  style={{ marginRight: '2px' }}
                />
                Stocking
              </label>
              <label htmlFor="nonStockingRadio">
                <input
                  type="radio"
                  id="nonStockingRadio"
                  name="Distributor_Type"
                  value="Non Stocking"
                  checked={Distributor_Type === 'Non Stocking'}
                  onChange={(e) => setDistributorType(e.target.value)}
                  style={{ marginRight: '2px' }}
                />
                Non-Stocking
              </label>
              <label htmlFor="otherRadio">
                <input
                  type="radio"
                  id="otherRadio"
                  name="Distributor_Type"
                  value="Other"
                  checked={Distributor_Type === 'Other'}
                  onChange={(e) => setDistributorType(e.target.value)}
                  style={{ marginRight: '2px' }}
                />
                Other
              </label>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', marginBottom: '15px' }}>
          <div style={{ marginRight: '10px', flex: '1' }}> 
            <label htmlFor="Issue_Date" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Issue Date <span style={{ color: 'red' }}>*</span> </label>
            <input
              type="date"
              id="Issue_Date"
              value={Issue_Date}
              onChange={(e) => setIssueDate(e.target.value)}
              placeholder="Select or enter issue date"
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ flex: '1' }}>
            <label htmlFor="Owner" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Owner <span style={{ color: 'red' }}>*</span> </label>
            <input
              type="text"
              id="Owner"
              value={Owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Enter your name"
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
              required
            />
          </div>
      </div>
      
          <button
            style={buttonStyle}
            onClick={handleDialogOpen}
          >
            Add Product
          </button>
          <Dialog open={isDialogOpen} onClose={handleDialogClose} style={dialogStyle}>
            <div className="flex items-center justify-center min-h-screen sm:block sm:p-4">
              <DialogPanel className="max-w-lg space-y-4 rounded-lg bg-gray-200 shadow-xl p-4">
                <DialogTitle className="font-bold text-gray-900">Please confirm the product information</DialogTitle>
                <p className="text-sm text-gray-700">Are you sure you want to add this product?</p>
                <div className="flex justify-end">
                  <Button onClick={handleDialogClose} 
                    style={buttonStyle2}
                    className="rounded-md border border-gray-300 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Cancel
                  </Button>
                  <Button
                    onClick={addProduct}
                    style={buttonStyle2}
                    className="ml-2 rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Product
                  </Button>
                </div>
                {errorMessage && <p className="text-red-500" style={{ color: 'red' }}>{errorMessage}</p>}
              </DialogPanel>
            </div>
          </Dialog>

      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', marginBottom: '10px', marginLeft: '-8px'}}>Dashboard</h2>
        <table style={{ width: '100%', marginLeft: '-10px'}}>
          <thead style={{ textAlign: 'left', fontSize: '0.8em' }}>
            <tr>
              <th>Manufacture</th>
              <th>Distributor</th>
              <th>State</th>
              <th>EN_Item_No</th>
              <th>Competitor_Item_No</th>
              <th>Mfg_Stocking_Price</th>
              <th>DistributorType</th>
              <th>Issue Date</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.EN_Item_No}>
                <td>{product.Manufacturer}</td>
                <td>{product.Distributor}</td>
                <td>{product.State}</td>
                <td>{product.EN_Item_No}</td>
                <td>{product.Competitor_Item_No}</td>
                <td>${product.Mfg_Stocking_Price}</td>
                <td>{product.Distributor_Type}</td>
                <td>{product.Issue_Date}</td>
                <td>{product.Owner}</td>
                <td>
                  <Button style={buttonStyle3} onClick={() => deleteProduct(product)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px'}}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Import Multiple Data from Excel Spreadsheet</h3>
        <form method="POST" action="/process_data" encType="multipart/form-data">
          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <label htmlFor="fileInput" style={{ flex: '1', marginBottom: '5px', color: '#333' }}>
              Please download the template and fill out the data. (Do not change the columns!)
            </label>
            <button type="button" style={{ marginLeft: '10px' }} onClick={handleDownloadTemplate}>
              Download Template
            </button>
          </div>
          <input
            type="file"
            id="fileInput"
            name="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
            className="form-control"
          />
          <button type="submit" style={buttonStyle} className="btn btn-primary" onClick={handleSubmit}>
            Import
          </button>
        </form>
        {importAttempted && (
          <p>
            {imported ? (
              <span style={{ color: 'black' }}>File imported successfully!</span>
            ) : (
              <span style={{ color: 'red' }}>Failed! Please check the file or format and try again!</span>
            )}
            {missingFields.length > 0 && (
              <div>
                <p style={{ color: 'red' }}>Missing fields: {missingFields.join(', ')}</p>
              </div>
            )}
          </p>
      )}
      </div>
      <div style= {buttonReturn}>
          <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Clear</a>
      </div>

    </div>
  );
};



export default PIM;
