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



const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function Appointments() {
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

  const getData = async () => {
    const url = `get_appointments?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&status=${statusFilters.join(
      ", "
    )}&type=${typeFilters.join(
      ", "
    )}&current_cancel_req_status=${cacellationReq.join(", ")}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
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
        <CheckboxGroup
          colorScheme="blue"
          onChange={handleStatusChange}
          value={statusFilters}
        >
          <Flex mb={5} gap={4} alignItems={"center"}>
            <Text fontSize={"md"} fontWeight={600}>
              Status -{" "}
            </Text>
            <Checkbox value="Confirmed">Confirmed</Checkbox>
            <Checkbox value="Visited">Visited</Checkbox>
            <Checkbox value="Completed">Completed</Checkbox>
            <Checkbox value="Pending">Pending</Checkbox>
            <Checkbox value="Cancelled">Cancelled</Checkbox>
            <Checkbox value="Rejected">Rejected</Checkbox>
          </Flex>
        </CheckboxGroup>{" "}
        <Button
          isLoading={isFetching || isRefetching}
          size={"sm"}
          colorScheme="blue"
          onClick={() => {
            queryClient.invalidateQueries(
              ["appointments", page, debouncedSearchQuery, statusFilters],
              { refetchInactive: true }
            );
          }}
          rightIcon={<RefreshCwIcon size={14} />}
        >
          Refresh Table
        </Button>
      </Flex>
      <CheckboxGroup
        colorScheme="blue"
        onChange={handleCancellationChange}
        value={cacellationReq}
      >
        <Flex mb={5} gap={4} alignItems={"center"}>
          <Text fontSize={"md"} fontWeight={600}>
            Cancellation Request -{" "}
          </Text>
          <Checkbox value="Initiated">Initiated</Checkbox>
          <Checkbox value="Processing">Processing</Checkbox>
          <Checkbox value="Approved">Approved</Checkbox>
          <Checkbox value="Rejected">Rejected</Checkbox>
        </Flex>
      </CheckboxGroup>{" "}
      <CheckboxGroup
        colorScheme="blue"
        onChange={handleTypeChange}
        value={typeFilters}
      >
        <Flex mb={5} gap={4} alignItems={"center"}>
          <Text fontSize={"md"} fontWeight={600}>
            Type -{" "}
          </Text>
          {["OPD", "Video Consultant", "Emergency"].map((type) => (
            <Checkbox value={type} key={type}>
              {type}
            </Checkbox>
          ))}
        </Flex>
      </CheckboxGroup>{" "}
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
                onClick={() => navigate(`/appointment/${appointment.id}`)}
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
                      Doctor: {appointment.doct_f_name}{" "}
                      {appointment.doct_l_name}
                    </Text>{" "}
                    <Text>
                      Patient: {appointment.patient_f_name}{" "}
                      {appointment.patient_l_name} #{appointment.patient_id}
                    </Text>
                  </Box>
                </Flex>
                <Divider my={3} />

                <Flex justify={"space-between"} align={"center"}>
                  {" "}
                  <Text fontSize={"sm"} fontWeight={"600"} color={"green.500"}>
                    Date: {appointment.date}
                  </Text>
                  <Text fontSize={"sm"} fontWeight={"600"} color={"green.500"}>
                    Time: {appointment.time_slots}
                  </Text>
                </Flex>
                <Flex justify={"space-between"} align={"center"} mt={2}>
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
                </Flex>
                <Flex justify={"space-between"} align={"center"} mt={2}>
                  {" "}
                  <Text fontSize={"sm"}>
                    Payment :{" "}
                    {appointment?.payment_status === "Paid" ? (
                      <Badge colorScheme="green">
                        {appointment.payment_status}
                      </Badge>
                    ) : appointment.payment_status === "Refunded" ? (
                      <Badge colorScheme="blue">
                        {appointment.payment_status}
                      </Badge>
                    ) : (
                      <Badge colorScheme="red">{"Not Paid"}</Badge>
                    )}
                  </Text>
                  <Text fontSize={"sm"}>
                    Source:{" "}
                    <Badge
                      colorScheme={
                        appointment.source === "Web" ? "purple" : "blue"
                      }
                    >
                      {appointment.source}
                    </Badge>
                  </Text>
                </Flex>
                <Flex justify={"space-between"} align={"center"} mt={2}>
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
                </Flex>
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
      {isOpen && <AddNewAppointment isOpen={isOpen} onClose={onClose} />}
    </Box>
  );
}
