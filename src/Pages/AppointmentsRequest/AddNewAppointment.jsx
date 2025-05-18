import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  useColorModeValue,
  Heading,
  FormControl,
  FormLabel,
  Input,
  CardBody,
  Card,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

import { ChevronDownIcon } from "lucide-react";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useDoctorData from "../../Hooks/UseDoctorData";
import usePatientData from "../../Hooks/UsePatientsData";
import UsersCombobox from "../../Components/UsersComboBox";
import AvailableTimeSlotes from "./AvailableTimeSlotes";
import AddPatients from "../Patients/AddPatients";

import { ADD, GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";
import getStatusBadge from "../../Hooks/StatusBadge";

const defStatus = ["Pending", "Confirmed"];
const paymentModes = [
  { id: 1, name: "Cash" },
  { id: 2, name: "Online" },
  { id: 3, name: "Other" },
  { id: 4, name: "Wallet" },
  { id: 5, name: "UPI" },
];

const getTypeBadge = (type) => {
  const badgeProps = {
    p: "5px",
    px: 10,
  };

  switch (type) {
    case "Emergency":
      return <Badge colorScheme="red" {...badgeProps}>{type}</Badge>;
    case "OPD":
      return <Badge colorScheme="green" {...badgeProps}>{type}</Badge>;
    default:
      return <Badge colorScheme="blue" {...badgeProps}>{type}</Badge>;
  }
};

const getFee = (type, doct) => {
  switch (type) {
    case "Emergency":
      return doct?.emg_fee;
    case "OPD":
      return doct?.opd_fee;
    case "Video Consultant":
      return doct?.video_fee;
    default:
      return doct?.emg_fee;
  }
};


function AddNewAppointment({ isOpen, onClose, PatientID ,appointmentData}) {
  const toast = useToast();
  const { isOpen: timeSlotisOpen, onOpen: timeSlotonOpen, onClose: timeSlotonClose } = useDisclosure();
  const { isOpen: AddPatientisOpen, onOpen: AddPatientonOpen, onClose: AddPatientonClose } = useDisclosure();

  const { doctorsData } = useDoctorData();
  const { patientsData } = usePatientData();
  const queryClient = useQueryClient();

  const [patient, setpatient] = useState();
  const [patientId, setpatientId] = useState();
  const [email, setEmail] = useState();

  
  const [doct, setdoct] = useState();
  const [selectedDate, setselectedDate] = useState();
  const [selectedSlot, setselectedSlot] = useState();
  const [status, setstatus] = useState("pending");
  const [type, settype] = useState("Video Consultant");
  const [paymentStatus, setpaymentStatus] = useState("Paid");
  const [paymentMathod, setpaymentMathod] = useState();
  const [defalutDataForPationt, setdefalutDataForPationt] = useState(PatientID);
  const [symptoms, setsymptoms] = useState("");

  const [from_time, setFromTime] = useState("");
  const [to_time, setToTime] = useState("");
  

  useEffect(() => {
    if (appointmentData) {
      setsymptoms(appointmentData.symptom);
      setEmail(appointmentData.email);
      setstatus("pending");
      setFromTime(appointmentData.from_time);
      setToTime(appointmentData.to_time);
      let pName = appointmentData.f_name + " " + appointmentData.l_name + " " + appointmentData.phone ;
      setpatient(pName);
      setpatientId(appointmentData.patient_id);
    }
  }, [appointmentData]);


  const addAppointment = async (data) => {
    
    let formData = {
      patient_id: patientId,
      status: status,
      date: selectedDate,
      time_slots: selectedSlot.time_start,
      doct_id: doct.user_id,
      dept_id: doctorDetails.department,
      type: type,
      fee: getFee(type, doct),
      total_amount: getFee(type, doct),
      unit_total_amount: getFee(type, doct),
      invoice_description: type,
      payment_method: paymentMathod || null,
      service_charge: 0,
      payment_transaction_id:
        paymentStatus === "Paid" ? "Pay at Hospital" : null,
      is_wallet_txn: 0,
      payment_status: paymentStatus,
      source: "Admin",
    };
   
  const res = await ADD(admin.token, "add_appointment", data);
  if (res.response !== 200) throw new Error(res.message);
  return res;
}

  const { data: doctorDetails, isLoading: isDoctLoading } = useQuery({
    queryKey: ["doctor", doct?.user_id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${doct?.user_id}`);
      return res.data;
    },
    enabled: !!doct,
  });

  const checkMissingValues = () => {
    if (!patient) return "patient";
    if (!doct) return "doctor";
    if (!type) return "Appointment Type";
    if (!selectedDate) return "Date";
    if (!selectedSlot) return "Time Slot";
    if (!status) return "Appointment status";
    if (!paymentStatus) return "Payment Status";
    // if (paymentStatus === "Paid" && !paymentMathod) return "Payment Method";
    return null;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const missingField = checkMissingValues();
      if (missingField) throw new Error(`Please select ${missingField}`);
      if (isDoctLoading || !doctorDetails) throw new Error("Unable to fetch doctor details");

      const fee = getFee(type, doct);
      const formData = {
        patient_id: patientId,
        email: email,
        status,
        date: selectedDate,
        time_slots: selectedSlot.time_start,
        doct_id: doct.user_id,
        dept_id: doctorDetails.department,
        type,
        fee,
        total_amount: fee,
        unit_total_amount: fee,
        invoice_description: type,
        payment_method: paymentMathod || null,
        service_charge: 0,
        payment_transaction_id: paymentStatus === "Paid" ? "Pay at Hospital" : null,
        is_wallet_txn: 0,
        payment_status: paymentStatus,
        source: "Admin",
      };

      await addAppointment(formData);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Appointment added successfully");
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["main-appointments"]);
      onClose();
    },
    onError: (err) => {
      ShowToast(toast, "error", err.message);
    },
  });

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" onOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Patient & Doctor Selection */}
            <Flex gap={10}>
              <Flex flex={3} gap={4} align="center">
              <FormControl>
                  <FormLabel fontSize="sm" mb={0}>Patient Name</FormLabel>
                  <FormLabel fontSize="sm" mb={0}>{patient}</FormLabel>
              </FormControl>
                {/* <UsersCombobox
                  data={patientsData}
                  name="Patient"
                  setState={setpatient}
                  defaultData={defalutDataForPationt}
                  addNew={true}
                  addOpen={AddPatientonOpen}
                /> */}
                {/* Or */}
                {/* <Button size="xs" w={120} colorScheme="blue" onClick={AddPatientonOpen}>
                  Add patient
                </Button> */}
              </Flex>
              <Flex flex={2}>
                <UsersCombobox data={doctorsData} name="Doctor" setState={setdoct} />
              </Flex>
            </Flex>

            {/* Appointment Details */}
            <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
              <CardBody p={3}>
                <Heading as="h3" size="sm">Appointment Details</Heading>
                <Divider mt={2} mb={5} />
                <Flex gap={5}>
                  {/* Appointment Type */}
                  <FormControl>
                    <FormLabel fontSize="sm" mb={0}>Appointment Type</FormLabel>
                    <FormLabel fontSize="sm" mb={0}>{symptoms}</FormLabel>
                    {/* <Menu>
                      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="transparent" w="100%" borderBottom="1px solid">
                        {type ? getTypeBadge(type) : "Select Appointment Type"}
                      </MenuButton>
                      <MenuList>
                        {["OPD", "Video Consultant", "Emergency"].map((option) => (
                          <MenuItem
                            key={option}
                            onClick={() => {
                              if (option !== "OPD") setpaymentStatus("Paid");

                              if (option === "Emergency") {
                                settype(option);
                                setselectedDate(moment().format("YYYY-MM-DD"));
                                setselectedSlot({ time_start: moment().format("HH:mm") });
                              } else {
                                setselectedDate();
                                setselectedSlot();
                                settype(option);
                              }
                            }}
                          >
                            {getTypeBadge(option)}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu> */}
                  </FormControl>

                  {/* Appointment Date */}
                  <FormControl>
                    <FormLabel fontSize="sm" mb={0}>Appointment Date</FormLabel>
                    <Input
                      size="sm"
                      variant="flushed"
                      value={selectedDate ? moment(selectedDate).format("DD-MM-YYYY") : ""}
                      onClick={() => {
                        if (!doct || !type) {
                          return ShowToast(toast, "error", !doct ? "Please Select Doctor" : "Please Select Appointment Type");
                        }
                        timeSlotonOpen();
                      }}
                      readOnly
                      cursor="pointer"
                    />
                  </FormControl>
                </Flex>

                {/* Time Slot & Status */}
                <Flex gap={5} mt={2}>
                  <FormControl>
                    <FormLabel fontSize="sm" mb={0}>Time Slot</FormLabel>
                    <Input
                      size="sm"
                      variant="flushed"
                      value={selectedSlot ? moment(selectedSlot.time_start, "hh:mm").format("hh:mm A") : "Select Time Slot"}
                      readOnly
                      onClick={() => {
                        if (!doct) return ShowToast(toast, "error", "Please Select Doctor");
                        timeSlotonOpen();
                      }}
                      cursor="pointer"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" mb={0}>Status</FormLabel>
                    <Menu>
                      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="transparent" w="100%" borderBottom="1px solid">
                      {status ? getStatusBadge(status) : "Select Status"}
                      </MenuButton>
                      <MenuList>
                        {defStatus.map((option) => (
                          <MenuItem key={option} onClick={() => setstatus(option)}>
                            {getStatusBadge(option)}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </FormControl>
                </Flex>
              </CardBody>
            </Card>

            {/* Payment Details */}
            <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
              <CardBody p={3}>
                <Heading as="h3" size="sm">Prefered Time</Heading>
                <Divider mt={2} mb={5} />
                <Flex gap={5}>
                  <FormControl>
                    <FormLabel fontSize="sm" mb={0}>From Time</FormLabel>
                    <FormLabel fontSize="sm" mb={0}>{from_time}</FormLabel>                    
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" mb={0}>To Time</FormLabel>
                    <FormLabel fontSize="sm" mb={0}>{to_time}</FormLabel>                    
                  </FormControl>
                </Flex>
              </CardBody>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} size="sm" onClick={onClose}>Close</Button>
            <Button
              colorScheme="blue"
              size="sm"
              isLoading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Add Appointment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Time Slot Modal */}
      {timeSlotisOpen && (
        <AvailableTimeSlotes
          isOpen={timeSlotisOpen}
          onClose={timeSlotonClose}
          doctID={doct?.user_id}
          selectedDate={selectedDate}
          setselectedDate={setselectedDate}
          selectedSlot={selectedSlot}
          setselectedSlot={setselectedSlot}
          type={type}
        />
      )}

      {/* Add Patient Modal */}
      {AddPatientisOpen && (
        <AddPatients
          isOpen={AddPatientisOpen}
          onClose={AddPatientonClose}
          nextFn={(data) => setdefalutDataForPationt(data)}
        />
      )}
    </Box>
  );
}

export default AddNewAppointment;
