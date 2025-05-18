/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  Grid,
  Input,
  Skeleton,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useNavigate } from "react-router-dom";
import getStatusBadge from "../../Hooks/StatusBadge";
import getCancellationStatusBadge from "../../Hooks/CancellationReqBadge";
import AddNewAppointment from "./AddNewAppointment";
// import CountdownTimer from "./CountdownTimer";
import { useEffect, useRef, useState } from "react";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import ErrorPage from "../../Components/ErrorPage";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { RefreshCwIcon } from "lucide-react";
import t from "../../Controllers/configs";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import getStatusColor from "../../Hooks/GetStatusColor";
import imageBaseURL from "../../Controllers/image";
import { ADD } from "../../Controllers/ApiControllers";



const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function AppointmentsRequest() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [statusFilters, setStatusFilters] = useState([]); // Track status filters
  const [typeFilters, settypeFilters] = useState([]); // Track type filters
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { hasPermission } = useHasPermission();
  const queryClient = useQueryClient();
  const { selectedClinic } = useSelectedClinic();
  const [cacellationReq, setCacellationReq] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleStatusChange = (selectedStatuses) => {
    setStatusFilters(selectedStatuses || ""); // Update the state when checkboxes change
  };
  const handleCancellationChange = (selectedStatuses) => {
    setCacellationReq(selectedStatuses || ""); // Update the state when checkboxes change
  };
  const handleTypeChange = (selectedType) => {
    settypeFilters(selectedType || ""); // Update the state when checkboxes change
  };
  function CountdownTimer({ toTime, fromTime }) {
  
    useEffect(() => {
      if (!toTime || !fromTime) {
        setTimeLeft("Invalid Time");
        return;
      }
  
      const [toH, toM, toS = "00"] = toTime.split(":").map(Number);
      const [fromH, fromM, fromS = "00"] = fromTime.split(":").map(Number);
      const now = new Date();
  
      const toDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), toH, toM, toS);
      const fromDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), fromH, fromM, fromS);
  
      const diffBetweenFromTo = (toDateTime - fromDateTime) / (1000 * 60); // in minutes
  
      if (diffBetweenFromTo > 90) {
        // setTimeLeft("Time Expired");
        return;
      }
  
      const interval = setInterval(() => {
        const currentTime = new Date();
        const diff = toDateTime - currentTime;
  
        if (diff <= 0) {
          setTimeLeft("Time Expired");
          clearInterval(interval);
        } else {
          const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
          const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, "0");
          setTimeLeft(`${hrs}:${mins}:${secs}`);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }, [toTime, fromTime]);
  
    return (
      <Text fontSize="sm" fontWeight="600" color="blue.500">
        Countdown: {timeLeft}
      </Text>
    );
  }

  const addPatientAndNavigate = async (appointment,timeLeft) => {
    try {
      if (timeLeft === "Time Expired") {
        console.log("timeLeft",timeLeft);
        toast({
          title: "Appointment Time Expired",
          description: "You cannot add a patient. The appointment time has expired.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      let addPatientformData = new FormData();
      addPatientformData.append("f_name", appointment.f_name);
      addPatientformData.append("l_name", appointment.l_name);
      addPatientformData.append("phone", appointment.phone);
      addPatientformData.append("gender", appointment.gender);
      addPatientformData.append("isd_code", "+91");
      addPatientformData.append("clinic_id", 8);
      addPatientformData.append("email", appointment.email);
  
      const res = await ADD(admin.token, "add_patient", addPatientformData);
      if (res.response !== 200) {
        throw new Error(res.message);
      }
      appointment.patient_id = res.id;
      setSelectedAppointment(appointment);
      onOpen(); // open the modal
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to add patient",
        description: err.message || "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getData = async () => {
    const url = `get_symptom_request`;
    await t();
    const res = await GET(admin.token, url);
    return {
      total_record: res.total_record,
      maindata: res.data,
    };
  };

  const { isLoading, data, error, isFetching, isRefetching } = useQuery({
    queryKey: [
      "appointments",
      page,
      debouncedSearchQuery,
      JSON.stringify(statusFilters),
      JSON.stringify(typeFilters),
      JSON.stringify(cacellationReq),
      dateRange,
      selectedClinic?.id,
    ],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);

  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }

    return <ErrorPage errorCode={error.name} />;
  }

  if (!hasPermission("APPOINTMENT_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef}>
      <Flex mb={5} justify={"space-between"} align={"center"}>
        <Flex align={"center"} gap={4}>
          <Input
            size={"md"}
            placeholder="Search"
            w={400}
            maxW={"50vw"}
            onChange={(e) => setsearchQuery(e.target.value)}
            value={searchQuery}
          />
          <DateRangeCalender
            dateRange={dateRange}
            setDateRange={setdateRange}
            size={"md"}
          />
        </Flex>
        <Box>
          <Button
            size={"sm"}
            colorScheme="blue"
            onClick={() => {
              onOpen();
            }}
            isDisabled={!hasPermission("APPOINTMENT_ADD")}
          >
            Add New
          </Button>
        </Box>
      </Flex>
      {/* Status checkboxes */}
      <Flex alignItems={"top"} justifyContent={"space-between"}>
        {" "}
      </Flex>
      {isLoading || !data ? (
        <Box> 
          {/* Loading skeletons */}
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              xl: "repeat(3, 1fr)",
              "2xl": "repeat(4, 1fr)",
            }}
            gap={{ base: 4, md: 4, xl: 8 }}
            p={4}
          >
            {" "}
            {[...Array(16)].map((_, index) => (
              <Skeleton key={index} h={32} mt={2} borderRadius={6} />
            ))}
          </Grid>
        </Box>
      ) : data?.maindata?.length ? (
        <Box>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              xl: "repeat(3, 1fr)",
              "2xl": "repeat(4, 1fr)",
            }}
            gap={{ base: 4, md: 4, xl: 8 }}
            p={4}
            px={0}
          >
            {data?.maindata?.map((appointment) => (
              <Box
                position={"relative"}
                bg={useColorModeValue("white", "gray.900")}
                key={appointment.id}
                p={4}
                borderRadius="md"
                boxShadow="lg"
                border={"2px solid"}
                borderColor={getStatusColor(appointment.status)}
                cursor={"pointer"}
                transition={"transform 0.2s ease-in-out"}
                _hover={{
                  transform: "translateY(-3px) scale(1.02)",
                  transition: "transform 0.3s ease-in-out",
                  boxShadow: "xl",
                }}
                onClick={() => {
                  addPatientAndNavigate(appointment,timeLeft); // set selected appointment
                }}
              >
                <Badge
                  colorScheme="pink"
                  py={"5px"}
                  fontSize={"sm"}
                  position={"absolute"}
                  right={1}
                  top={1}
                  borderRadius={4}
                >
                  #{appointment.id}
                </Badge>
                <Flex gap={4}>
                  <Avatar src={`${imageBaseURL}/${appointment.doct_image}`} />{" "}
                  <Box>
                    {" "}
                    <Text fontWeight={"600"}>
                      Patient: {appointment.f_name}{" "} {appointment.l_name}
                      {appointment.doct_l_name}
                    </Text>{" "}
                    <Text>
                    symptom: {appointment.symptom}
                    </Text>
                  </Box>
                </Flex>
                <Divider my={3} />

                <Flex justify={"space-between"} align={"center"}>
                  {" "}
                  {/* <Text fontSize={"sm"} fontWeight={"600"} color={"green.500"}>
                    Date: {appointment.date}
                  </Text> */}
                  <Text fontSize={"sm"} fontWeight={"600"} color={"green.500"}>
                    Time: {appointment.from_time} - {appointment.to_time}

                    {/* <CountdownTimer toTime={appointment.to_time} /> */}
                    <CountdownTimer toTime={appointment.to_time} fromTime={appointment.from_time} />


                  </Text>

                  
                  
                  {/* <CountdownTimer toTime={appointment.to_time} /> */}
                </Flex>
                {/* <Flex justify={"space-between"} align={"center"} mt={2}>
                  {" "}
                  <Text>
                    Type:{" "}
                    {appointment.type === "Emergency" ? (
                      <Badge colorScheme="red" py={"5px"}>
                        {appointment.type}
                      </Badge>
                    ) : appointment.type === "Video Consultant" ? (
                      <Badge colorScheme="purple" py={"5px"}>
                        {appointment.type}
                      </Badge>
                    ) : (
                      <Badge colorScheme="green" py={"5px"}>
                        {appointment.type}
                      </Badge>
                    )}
                  </Text>
                  <Text>Status: {getStatusBadge(appointment.status)}</Text>
                </Flex> */}
                <Flex justify={"space-between"} align={"center"} mt={2}>
                  {" "}
                  <Text fontSize={"sm"}>
                    Payment :{" "}
                    <Badge colorScheme="green">PAID</Badge>
                  </Text>
                  {/* <Text fontSize={"sm"}>
                    Source:{" "}
                    <Badge
                      colorScheme={
                        appointment.source === "Web" ? "purple" : "blue"
                      }
                    >
                      {appointment.source}
                    </Badge>
                  </Text> */}
                </Flex>
                {/* <Flex justify={"space-between"} align={"center"} mt={2}>
                  {" "}
                  <Text fontSize={"sm"} fontWeight={"600"}>
                    Clinic ID : #{appointment.clinic_id}
                  </Text>
                  <Text fontSize={"sm"}>
                    Cancel Req :{" "}
                    {getCancellationStatusBadge(
                      appointment.current_cancel_req_status
                    )}
                  </Text>
                </Flex> */}
              </Box>
            ))}
          </Grid>
        </Box>
      ) : (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>No data found</AlertDescription>
        </Alert>
      )}
      <Flex justify={"center"} mt={4}>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPage}
        />
      </Flex>
      {/* Add New Appointment */}
      {/* {isOpen && <AddNewAppointment isOpen={isOpen} onClose={onClose} />} */}

      {isOpen && (
        <AddNewAppointment
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setSelectedAppointment(null); // reset after closing
          }}
          appointmentData={selectedAppointment} // 👈 pass data
        />
        
      )}


    </Box>
  );
}
