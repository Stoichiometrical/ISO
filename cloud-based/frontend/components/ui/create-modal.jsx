import React, {useEffect, useState} from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  CircularProgress, Textarea,
} from "@nextui-org/react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {API_3, API_4, API_URL, getCookie, getProjectName, setCookie, setProjectName as saveProjectNameToLocalStorage} from "@/lib/utils";
import useDataStore from "@/hooks/useDataStore";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {useUser} from "@clerk/nextjs";
import {Select} from "antd";
import 'ldrs/tailChase';
import {navigateToProject, navigateToReports} from "@/lib/server-actions";





export default function CreateProjectModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [backdrop, setBackdrop] = React.useState("blue");
  const setApiName = useDataStore((state) => state.setApiName);
  const api_name = useDataStore((state) => state.api_name);
  const [month, setMonth] = useState("");
  const [salesFile, setSalesFile] = useState(null);
  const [customerFile, setCustomerFile] = useState(null);
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submitting

    const formData = new FormData();
    formData.append("month", month);
    if (salesFile) formData.append("salesFile", salesFile);
    if (customerFile) formData.append("customerFile", customerFile);

    try {
      const response = await fetch(`${API_URL}/start_test`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json(); // Parse the response JSON
        setApiName(data.folder);
        console.log("API_NAME : ", api_name);
        alert("Data submitted successfully!");
        // Update the api_name state with the folder name

        // await navigate();
      } else {
        alert("Failed to submit data.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after response
    }
  };

 

  const backdrops = "blur";

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="flat"
          color="warning"
          onPress={() => onOpen()}
          className="capitalize"
        >
          Create New Project
        </Button>
      </div>
      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create New Project
              </ModalHeader>
              <ModalBody>

                <p>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center gap-3 justify-center  p-5"
                  >
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="month">Select Month</Label>
                      <Input
                        type="text"
                        id="month"
                        placeholder="Select Month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                      />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="sales">Upload Sales Data</Label>
                      <Input
                        id="sales"
                        type="file"
                        onChange={(e) => setSalesFile(e.target.files[0])}
                      />
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="customer-data">
                        Upload Customer Data
                      </Label>
                      <Input
                        id="customer-data"
                        type="file"
                        onChange={(e) => setCustomerFile(e.target.files[0])}
                      />
                    </div>


                  </form>
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>

                {loading ? (
                  <div className="flex justify-center items-center">
                    <CircularProgress label="Loading..." />
                  </div>
                ) : (
                  <Button
                    color="primary"
                    onPress={onClose}
                    onClick={handleSubmit}
                  >
                    Start
                  </Button>
                )}
                {/*<Button*/}
                {/*  color="primary"*/}
                {/*  onPress={onClose}*/}
                {/*  onClick={handleSubmit}*/}
                {/*>*/}
                {/*  Start*/}
                {/*</Button>*/}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export function ConnectMySQL(){
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [backdrop, setBackdrop] = React.useState("blue");
  const setApiName = useDataStore((state) => state.setApiName);
  const api_name = useDataStore((state) => state.api_name);
  const [month, setMonth] = useState("");
  const[url, setUrl] = useState("")
  const[queryprompt, setQuery] = useState("")
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submitting

    const formData = new FormData();
    formData.append("month", month);
    if (salesFile) formData.append("salesFile", salesFile);
    if (customerFile) formData.append("customerFile", customerFile);

    try {
      const response = await fetch(`${API_URL}/start_test`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json(); // Parse the response JSON
        setApiName(data.folder);
        console.log("API_NAME : ", api_name);
        alert("Data submitted successfully!");
        // Update the api_name state with the folder name

        // await navigate();
      } else {
        alert("Failed to submit data.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after response
    }
  };




  const backdrops = "blur";


  return(
      <>

        <div className="flex flex-wrap gap-3">
          <Button
              variant="flat"
              color="warning"
              onPress={() => onOpen()}
              className="capitalize"
          >
            Connect To MySQL Database
          </Button>
        </div>
        <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Connect To MySQL Database
                  </ModalHeader>
                  <ModalBody>
                    <p>
                      <form
                          onSubmit={handleSubmit}
                          className="flex flex-col items-center gap-3 justify-center  p-5"
                      >
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="url">Put MySQL URL</Label>
                          <Input
                              type="text"
                              id="url"
                              placeholder="Insert full database URL"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                          />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="month">Select Month</Label>
                          <Input
                              type="text"
                              id="month"
                              placeholder="Select Month You Would like To Forecast"
                              value={month}
                              onChange={(e) => setMonth(e.target.value)}
                          />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="query">Insert Database name,Table and Period</Label>
                          <Textarea

                              id="query"
                              placeholder="Please specify the database and table name that has your data and the period you want to get data for"
                              value={queryprompt}
                              onChange={(e) => setQuery(e.target.value)}
                          />
                        </div>

                        {/* Conditional rendering of loader */}
                        {/*{loading ? (*/}
                        {/*  <div className="flex justify-center items-center">*/}
                        {/*    <p>Loading...</p>*/}
                        {/*  </div>*/}
                        {/*) : (*/}
                        {/*  <Button type="submit" className="">*/}
                        {/*    Submit*/}
                        {/*  </Button>*/}
                        {/*)}*/}
                      </form>
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Close
                    </Button>

                    {loading ? (
                        <div className="flex justify-center items-center">
                          <CircularProgress label="Loading..."/>
                        </div>
                    ) : (
                        <Button
                            color="primary"
                            onPress={onClose}
                            onClick={handleSubmit}
                        >
                          Connect
                        </Button>
                    )}
                    {/*<Button*/}
                    {/*  color="primary"*/}
                    {/*  onPress={onClose}*/}
                    {/*  onClick={handleSubmit}*/}
                    {/*>*/}
                    {/*  Start*/}
                    {/*</Button>*/}
                  </ModalFooter>
                </>
            )}
          </ModalContent>
        </Modal>

      </>
  )
}





export function CreateNewProjectModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isLoaded, isSignedIn, user } = useUser();
  const [projectName, setProjectName] = useState("");
  const [salesFile, setSalesFile] = useState(null);
  const [customerFile, setCustomerFile] = useState(null);
  const [dateColumn, setDateColumn] = useState("");
  const [quantityColumn, setQuantityColumn] = useState("");
  const [priceColumn, setPriceColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submitting
    setShowButton(false);

    try {
      // Start the test first
      const formData = new FormData();
      formData.append("projectName", projectName);
      if (salesFile) formData.append("salesFile", salesFile);
      if (customerFile) formData.append("customerFile", customerFile);
      formData.append("dateColumn", dateColumn);
      formData.append("quantityColumn", quantityColumn);
      formData.append("priceColumn", priceColumn);

      const response = await fetch(`${API_3}/create_project`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json(); // Parse the response JSON
        setProjectName(data.folder)
        saveProjectNameToLocalStorage(data.folder)
        console.log("This is the data: ", data);

        alert("Data submitted successfully!");

        // Now create the project in MongoDB
        const projectData = {
          user_id: user.id,
          project_name: data.folder,
          reports: [],
          months: data.months, // Assuming month_names is captured from train_model
        };

        console.log("Data before : ",projectData)


        const projectResponse = await fetch(`${API_4}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectData)
        });

        if (projectResponse.ok) {
          const projectData = await projectResponse.json()
          await navigateToReports()
          alert(data.folder)
          console.log(projectData);
        } else {
          alert("Failed to create project.");
        }
      } else {
        alert("Failed to submit data.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after response
      setShowButton(true);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="flat"
          color="warning"
          onPress={() => onOpen()}
          className="capitalize"
        >
          Create New Project
        </Button>
      </div>

      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create New Project
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col items-center gap-3 justify-center p-5"
                >
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="projectName">Enter Project Name</Label>
                    <Input
                      type="text"
                      id="projectName"
                      placeholder="Enter Project Name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="sales">Upload Sales Data</Label>
                    <Input
                      id="sales"
                      type="file"
                      onChange={(e) => setSalesFile(e.target.files[0])}
                    />
                  </div>

                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="customer-data">Upload Customer Data</Label>
                    <Input
                      id="customer-data"
                      type="file"
                      onChange={(e) => setCustomerFile(e.target.files[0])}
                    />
                  </div>

                  <div className="text-center my-2">Please specify the name of the columns containing these attributes in your dataset</div>

                  <div className="flex p-2 gap-2">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="date-column" className="text-center">Date </Label>
                      <Input
                        type="text"
                        id="date-column"
                        placeholder="Date Column"
                        value={dateColumn}
                        onChange={(e) => setDateColumn(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="quantity-column" className="text-center">Quantity </Label>
                      <Input
                        type="text"
                        id="quantity-column"
                        placeholder="Quantity Column"
                        value={quantityColumn}
                        onChange={(e) => setQuantityColumn(e.target.value)}
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="price-column" className="text-center">Price </Label>
                      <Input
                        type="text"
                        id="price-column"
                        placeholder="Price Column"
                        value={priceColumn}
                        onChange={(e) => setPriceColumn(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center items-center">
                    {showButton && <Button color="primary" type="submit">Create</Button>}
                    {loading && (
                        <div className="flex justify-center items-center p-3">
                          <CircularProgress label="Loading..."/>

                        </div>
                    )}
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export function CreateReportModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMonths, setFetchingMonths] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const projectName = getProjectName(); // Replace with your function to get project name

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        setFetchingMonths(true);
        const response = await fetch(`${API_4}/projects/name/${projectName}/months`);
        if (response.ok) {
          const data = await response.json();
          console.log("Project Name :",projectName)
          setMonths(data.months); // Assuming response is { months: [...] }

        } else {
          console.error('Failed to fetch months');
        }
      } catch (error) {
        console.error('Error fetching months:', error);
      } finally {
        setFetchingMonths(false);
      }
    };

    if (projectName) {
      fetchMonths();
    }
  }, [projectName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('reportName', selectedMonth);
      formData.append('projectName', projectName);

      const response = await fetch(`${API_3}/create_report`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        console.log('Report created successfully:', data);
        setCookie(data.folder)

        // Now add the report to the project in Node.js backend
        const nodeResponse = await fetch(`${API_4}/projects/name/${projectName}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ report_name: data.folder }),
        });

        if (nodeResponse.ok) {
          await navigateToProject()
          console.log('Report added to project successfully');
          // Show success message or redirect user
        } else {
          console.error('Failed to add report to project');
          // Show error message to user
        }
      } else {
        console.error('Failed to create report:', data);
        // Show error message to the user
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error message to the user
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (value) => {
    setSelectedMonth(value);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="flat"
          color="warning"
          onClick={onOpen}
          className="capitalize"
        >
          Create New Report
        </Button>
      </div>

      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose} isDismissable={false}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Create New Report
          </ModalHeader>
          <ModalBody>
            {fetchingMonths ? (
              <div className="flex justify-center items-center">
                <CircularProgress label="Loading months..." />
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center gap-3 justify-center p-5"
              >
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="month">Select Month</Label>
                  <Select
                    id="month"
                    value={selectedMonth}
                    onChange={handleSelectChange}
                    style={{ width: '100%' }}
                  >
                    <option value="">Select a month</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-1 justify-center items-center">
                  <Button color="primary" type="submit" disabled={loading}>
                    Start
                  </Button>
                  {loading && (
                    <div className="flex justify-center items-center">
                      <CircularProgress label="Loading..." />
                    </div>
                  )}
                </div>
              </form>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export function BusinessObjectivesModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [salesGoals, setSalesGoals] = useState('');
  const [segmentationGoals, setSegmentationGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const api_name = getCookie()
   const projectName = getProjectName('project_name');

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_3}/save-business-objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sales_goals: salesGoals,
          segmentation_goals: segmentationGoals,
          api_name: api_name,
          project_name: projectName
        }),
      });

      if (response.ok) {
        alert('Business objectives saved successfully');
        // Reset form fields
        setSalesGoals('');
        setSegmentationGoals('');
      } else {
        console.error('Failed to save business objectives');
      }
    } catch (error) {
      console.error('Error saving business objectives:', error);
    } finally {
      setLoading(false);
      onClose(); // Close the modal after submitting
    }
  };

  return (
      <>
        <div className="flex flex-wrap gap-3">
          <Button variant="flat" color="warning" onClick={onOpen} className="capitalize">
            Define Business Objectives
          </Button>
        </div>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <Card>
              <CardHeader>
                <CardTitle>Business Objectives</CardTitle>
                <CardDescription>Define your sales and customer goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 flex flex-col">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="sales-goals" className="font-bold text-xl">
                    Sales Goals
                  </Label>
                  <Textarea
                      id="sales-goals"
                      placeholder="To improve ..."
                      value={salesGoals}
                      onChange={(e) => setSalesGoals(e.target.value)}
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="segmentation-goals">
                    Customer Optimization Objectives
                  </Label>
                  <Textarea
                      id="segmentation-goals"
                      placeholder="To increase ..."
                      value={segmentationGoals}
                      onChange={(e) => setSegmentationGoals(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button color="danger" variant="light" onClick={onClose}>
                  Close
                </Button>
                {loading ? (
                    <div className="flex flex-col gap-2 justify-center items-center">
                      <CircularProgress label="Loading..." />
                    </div>
                ) : (
                    <Button color="primary" onClick={handleSubmit}>
                      Submit
                    </Button>
                )}
              </CardFooter>
            </Card>
          </ModalContent>
        </Modal>
      </>
  );
}