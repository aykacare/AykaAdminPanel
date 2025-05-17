/* eslint-disable react-hooks/rules-of-hooks */
import { AiFillYoutube } from "react-icons/ai";
import { BsInstagram } from "react-icons/bs";
import { AiOutlineTwitter } from "react-icons/ai";
import { BiLinkExternal } from "react-icons/bi";
import { CgFacebook } from "react-icons/cg";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightElement,
  Select,
  Switch,
  Text,
  Textarea,
  Tooltip,
  VStack,
  theme,
  useColorModeValue,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ComboboxDemo } from "../../Components/ComboBox";
import { MultiTagInput } from "../../Components/MultiTaginput";
import { ADD, GET, UPDATE } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import TimeSlotes from "../../Components/DoctorTimeSlotes/TimeSlotes";
import Loading from "../../Components/Loading";
import RatingStars from "../../Hooks/ShowRating";
import ISDCODEMODAL from "../../Components/IsdModal";
import { FaChevronDown, FaTrash } from "react-icons/fa";
import imageBaseURL from "../../Controllers/image";
import useHasPermission from "../../Hooks/HasPermission";
import VideoTimeSlotes from "../../Components/VideoTimeSlotes/TimeSlotes";
import todayDate from "../../Controllers/today";
import Review from "./Review";
import DoctAppointments from "./DoctAppoinrtments";
import NotAuth from "../../Components/NotAuth";

const getSpclizeList = async () => {
  const res = await GET(admin.token, "get_specialization");
  return res.data;
};
const getDepartmentList = async () => {
  const res = await GET(admin.token, "get_department");
  return res.data;
};

export default function UpdateDoctor() {
  const param = useParams();
  const { data: doctorDetails, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["doctor", param.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${param.id}`);
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, setValue, watch } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [departmentID, setdepartmentID] = useState(doctorDetails?.department);
  const [specializationID, setspecializationID] = useState(
    doctorDetails?.specialization
  );
  const inputRef = useRef();
  const [isd_code, setisd_code] = useState(doctorDetails?.isd_code);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();

  useEffect(() => {
    setdepartmentID(doctorDetails?.department);
    setspecializationID(doctorDetails?.specialization);
  }, [doctorDetails]);

  const AddNew = async (data) => {
    if (data.password && data.password != data.cnfPassword) {
      return showToast(toast, "error", "password does not match");
    }

    if (!departmentID) {
      return showToast(toast, "error", "select department");
    }

    if (!specializationID) {
      return showToast(toast, "error", "select specialization");
    }

    let formData = {
      id: param.id,
      department: departmentID,
      specialization: Array.isArray(specializationID)
        ? specializationID.join(", ")
        : specializationID || "",
      isd_code_sec: isd_code,
      isd_code,
      ...data,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_doctor", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries(["doctor", param.id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileUpload = async (image) => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_doctor", {
        id: param.id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctor", param.id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_doctor_image", {
        id: param.id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Image Deleted!");
        queryClient.invalidateQueries("doctor", param.id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileUpload(selectedFile);
  };

  const { data: departmentList } = useQuery({
    queryKey: ["department"],
    queryFn: getDepartmentList,
  });

  const { data: specializationList } = useQuery({
    queryKey: ["specialization"],
    queryFn: getSpclizeList,
  });

  if (isDoctorLoading || isLoading) return <Loading />;
  if (!hasPermission("DOCTOR_UPDATE")) return <NotAuth />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"lg"}>
          Doctor Details #{param.id}
        </Heading>
        <Button
          w={120}
          size={"sm"}
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </Flex>

      <Tabs mt={5}>
        <TabList>
          <Tab>Doctor Details</Tab>
          <Tab>Time Slotes</Tab>
          <Tab>Reviews</Tab>
          <Tab>Appointments</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Flex gap={10} mt={2} as={"form"} onSubmit={handleSubmit(AddNew)}>
              {/* Left Section (75% width) */}
              <Box w={"75%"}>
                {/* Basic Details Card */}
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3}>
                    <Flex align={"center"} justify={"space-between"}>
                      <Heading as={"h3"} size={"sm"}>Basic Details</Heading>
                      <Flex gap={2} align="center">
                        <RatingStars rating={doctorDetails?.average_rating} />
                        <Text fontSize={"sm"} fontWeight={600}>
                          ({doctorDetails?.number_of_reviews} reviews),
                        </Text>
                        <Text fontSize={"sm"} fontWeight={600}>
                          {doctorDetails?.total_appointment_done} Appointments Done
                        </Text>
                      </Flex>
                    </Flex>
                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5} align={"flex-end"}>
                      <FormControl isRequired>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="First Name"
                          {...register("f_name")}
                          defaultValue={doctorDetails?.f_name}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Last Name"
                          {...register("l_name")}
                          defaultValue={doctorDetails?.l_name}
                        />
                      </FormControl>

                      <FormControl>
                        <FormControl display="flex" alignItems="center" mb={2} gap={3}>
                          <FormLabel htmlFor="email-alerts" mb="0" fontSize={"sm"}>
                            Doctor Active?
                          </FormLabel>
                          <IsActiveSwitch id={param.id} isActive={doctorDetails?.active} />
                        </FormControl>
                        <FormControl display="flex" alignItems="center" mb={2} gap={3}>
                          <FormLabel htmlFor="email-alerts" mb="0" fontSize={"sm"}>
                            Stop Booking?
                          </FormLabel>
                          <StopBooking id={param.id} isStop_booking={doctorDetails?.stop_booking} />
                        </FormControl>
                        <FormControl display="flex" alignItems="center" mb={2} gap={3}>
                          <FormLabel htmlFor="email-alerts" mb="0" fontSize={"sm"}>
                            Is Best Doctor?
                          </FormLabel>
                          <BestDoctor id={param.id} is_best_doctor={doctorDetails?.is_best_doctor} />
                        </FormControl>
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>Date Of Birth</FormLabel>
                        <Input
                          max={todayDate()}
                          size={"sm"}
                          type="date"
                          {...register("dob")}
                          defaultValue={doctorDetails?.dob}
                        />
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          size={"sm"}
                          {...register("gender")}
                          defaultValue={doctorDetails?.gender}
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Years of Experience</FormLabel>
                        <Input
                          size={"sm"}
                          type="number"
                          {...register("ex_year")}
                          defaultValue={doctorDetails?.ex_year}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>

                {/* Contact Details Card */}
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3}>
                    <Heading as={"h3"} size={"sm"}>Contact Details</Heading>
                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          size={"sm"}
                          type="email"
                          {...register("email")}
                          defaultValue={doctorDetails?.email}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Phone</FormLabel>
                        <InputGroup size={"sm"}>
                          <InputLeftAddon
                            cursor={"pointer"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpen();
                            }}
                          >
                            {isd_code || doctorDetails?.isd_code}{" "}
                            <FaChevronDown style={{ marginLeft: "5px" }} />
                          </InputLeftAddon>
                          <Input
                            borderRadius={6}
                            type="tel"
                            {...register("phone")}
                            defaultValue={doctorDetails?.phone}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Secondary Phone</FormLabel>
                        <InputGroup size={"sm"}>
                          <InputLeftAddon
                            cursor={"pointer"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpen();
                            }}
                          >
                            {isd_code || doctorDetails?.isd_code}{" "}
                            <FaChevronDown style={{ marginLeft: "5px" }} />
                          </InputLeftAddon>
                          <Input
                            borderRadius={6}
                            type="tel"
                            {...register("phone_sec")}
                            defaultValue={doctorDetails?.phone_sec}
                          />
                        </InputGroup>
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>

                {/* Education and Other Details Card */}
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3}>
                    <Heading as={"h3"} size={"sm"}>Education and Other Details</Heading>
                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>Department</FormLabel>
                        <ComboboxDemo
                          name={"Department"}
                          data={departmentList}
                          setState={setdepartmentID}
                          defaultId={doctorDetails?.department}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Specialization</FormLabel>
                        <MultiTagInput
                          data={specializationList}
                          setState={setspecializationID}
                          name={"Specialization"}
                          defaultSelected={doctorDetails?.specialization?.split(", ")}
                        />
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          height="200px"
                          placeholder="Description"
                          size="sm"
                          resize={"vertical"}
                          {...register("description")}
                          defaultValue={doctorDetails?.description}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>

                {/* Address Card */}
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3}>
                    <Heading as={"h3"} size={"sm"}>Address</Heading>
                    <Divider mt={2} mb={5} />

                    <Flex gap={10}>
                      <FormControl>
                        <FormLabel>State</FormLabel>
                        <Input
                          size={"sm"}
                          type="text"
                          {...register("state")}
                          defaultValue={doctorDetails?.state}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input
                          size={"sm"}
                          type="text"
                          {...register("city")}
                          defaultValue={doctorDetails?.city}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Postal Code</FormLabel>
                        <Input
                          size={"sm"}
                          type="number"
                          {...register("postal_code")}
                          defaultValue={doctorDetails?.postal_code}
                        />
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Full Address</FormLabel>
                        <Textarea
                          placeholder="Address"
                          size="sm"
                          resize={"vertical"}
                          {...register("address")}
                          defaultValue={doctorDetails?.address}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>

                {/* Password Card */}
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3}>
                    <Heading as={"h3"} size={"sm"}>Password</Heading>
                    <Divider mt={2} mb={5} />

                    <Flex gap={10}>
                      <FormControl>
                        <FormLabel>New Password</FormLabel>
                        <Input
                          size={"sm"}
                          type="password"
                          {...register("password")}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                          size={"sm"}
                          type="password"
                          {...register("cnfPassword")}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>

                <Button
                  w={"100%"}
                  mt={10}
                  type="submit"
                  colorScheme="green"
                  size={"sm"}
                  isLoading={isLoading}
                >
                  Update Doctor
                </Button>
              </Box>

              {/* Right Section (25% width) */}
              <Box w={"25%"}>
                {/* Profile Picture Card */}
                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                >
                  <CardBody p={2}>
                    <Heading as={"h3"} size={"sm"} textAlign="center">
                      Profile Picture
                    </Heading>
                    <Divider mt={2} />
                    <Flex p={2} justify={"center"} mt={5} position={"relative"}>
                      <Image
                        borderRadius={"50%"}
                        h={150}
                        objectFit={"cover"}
                        w={150}
                        src={
                          doctorDetails?.image
                            ? `${imageBaseURL}/${doctorDetails?.image}`
                            : "/admin/profilePicturePlaceholder.png"
                        }
                      />
                      {doctorDetails?.image && (
                        <Tooltip label="Delete" fontSize="md">
                          <IconButton
                            size={"sm"}
                            colorScheme="red"
                            variant={"solid"}
                            position={"absolute"}
                            right={5}
                            icon={<FaTrash />}
                            onClick={handleFileDelete}
                          />
                        </Tooltip>
                      )}
                    </Flex>
                    <VStack spacing={4} align="stretch" mt={10}>
                      <Input
                        size={"sm"}
                        type="file"
                        display="none"
                        ref={inputRef}
                        onChange={handleFileChange}
                        accept=".jpeg, .svg, .png , .jpg , .avif"
                      />
                      <Button
                        isDisabled={doctorDetails?.image !== null}
                        size={"sm"}
                        onClick={() => inputRef.current.click()}
                        colorScheme="blue"
                      >
                        Upload Profile Picture
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Social Accounts Card */}
                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                >
                  <CardBody p={2}>
                    <Heading as={"h3"} size={"sm"}>Social Accounts</Heading>
                    <Divider mt={2} mb={5} />

                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <CgFacebook size={"20"} color={theme.colors.facebook[500]} />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Facebook"
                        defaultValue={doctorDetails?.fb_linik}
                        {...register("fb_linik")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          if (/^(ftp|http|https):\/\/[^ "]+$/.test(doctorDetails?.fb_linik)) {
                            window.open(doctorDetails?.fb_linik, "_blank");
                          } else {
                            ShowToast(toast, "error", "Invalid URL");
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>

                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <AiOutlineTwitter size={"20"} color={theme.colors.twitter[500]} />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Twitter"
                        defaultValue={doctorDetails?.twitter_link}
                        {...register("twitter_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          if (/^(ftp|http|https):\/\/[^ "]+$/.test(doctorDetails?.twitter_link)) {
                            window.open(doctorDetails?.twitter_link, "_blank");
                          } else {
                            ShowToast(toast, "error", "Invalid URL");
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>

                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <BsInstagram size={"20"} color={theme.colors.red[400]} />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Instagram"
                        defaultValue={doctorDetails?.insta_link}
                        {...register("insta_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          if (/^(ftp|http|https):\/\/[^ "]+$/.test(doctorDetails?.insta_link)) {
                            window.open(doctorDetails?.insta_link, "_blank");
                          } else {
                            ShowToast(toast, "error", "Invalid URL");
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>

                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <AiFillYoutube size={20} color={theme.colors.red[600]} />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Youtube"
                        defaultValue={doctorDetails?.you_tube_link}
                        {...register("you_tube_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          if (/^(ftp|http|https):\/\/[^ "]+$/.test(doctorDetails?.you_tube_link)) {
                            window.open(doctorDetails?.you_tube_link, "_blank");
                          } else {
                            ShowToast(toast, "error", "Invalid URL");
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                  </CardBody>
                </Card>

                {/* Fees Card with Earnings Calculation */}
                <FeesForm
                  doctorDetails={doctorDetails}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                />
              </Box>
            </Flex>
          </TabPanel>

          <TabPanel p={0}>
            <TimeSlotes doctorID={param.id} />
            <Divider my={10} />
            <VideoTimeSlotes doctorID={param.id} />
          </TabPanel>

          <TabPanel p={0}>
            <Review doctID={param.id} doctorDetails={doctorDetails} />
          </TabPanel>

          <TabPanel p={0}>
            <DoctAppointments doctID={param.id} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setisd_code}
      />
    </Box>
  );
}

// Fees Form Component with Earnings Calculation
const FeesForm = ({ doctorDetails, register, setValue, watch }) => {
  const [appointments, setAppointments] = useState({
    video_appointment: doctorDetails?.video_appointment,
    clinic_appointment: doctorDetails?.clinic_appointment,
    emergency_appointment: doctorDetails?.emergency_appointment,
  });

  const handleToggle = (type) => {
    setAppointments((prev) => {
      const updatedValue = prev[type] === 1 ? 0 : 1;
      setValue(type, updatedValue);
      return { ...prev, [type]: updatedValue };
    });
  };

  useEffect(() => {
    setAppointments({
      video_appointment: doctorDetails?.video_appointment,
      clinic_appointment: doctorDetails?.clinic_appointment,
      emergency_appointment: doctorDetails?.emergency_appointment,
    });
  }, [doctorDetails]);

  return (
    <Card
      mt={5}
      bg={useColorModeValue("white", "gray.700")}
      h="fit-content"
      pb={5}
    >
      <CardBody p={2}>
        <Heading as="h3" size="sm">
          Fees
        </Heading>
        <Divider mt={2} mb={2} />

        {/* OPD Appointment Section */}
        <FormControl display="flex" alignItems="center" mb={2}>
          <FormLabel mb="0">OPD Appointment - </FormLabel>
          <Switch
            isChecked={appointments.clinic_appointment === 1}
            onChange={() => handleToggle("clinic_appointment")}
            size={"sm"}
          />
        </FormControl>
        {appointments.clinic_appointment === 1 && (
          <FormControl>
            <FormLabel>OPD Fee</FormLabel>
            <Input
              size="sm"
              borderRadius={6}
              type="number"
              placeholder="OPD Fee"
              {...register("opd_fee", {
                onChange: (e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setValue("opd_earning", value * 0.8);
                }
              })}
              defaultValue={doctorDetails?.opd_fee}
            />
            <Text fontSize="xs" color="green.600" mt={1}>
              Your earnings: ₹{watch("opd_fee") ? (watch("opd_fee") * 0.8).toFixed(2) : "0.00"}
            </Text>
          </FormControl>
        )}

        <Divider my={3} />

        {/* Video Appointment Section */}
        <FormControl display="flex" alignItems="center" mb={2}>
          <FormLabel mb="0">Video Appointment - </FormLabel>
          <Switch
            isChecked={appointments.video_appointment === 1}
            onChange={() => handleToggle("video_appointment")}
            size={"sm"}
          />
        </FormControl>
        {appointments.video_appointment === 1 && (
          <FormControl mt={3}>
            <FormLabel>Video Fee</FormLabel>
            <Input
              size="sm"
              borderRadius={6}
              type="number"
              placeholder="Video Fee"
              {...register("video_fee", {
                onChange: (e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setValue("video_earning", value * 0.8);
                }
              })}
              defaultValue={doctorDetails?.video_fee}
            />
            <Text fontSize="xs" color="green.600" mt={1}>
              Your earnings: ₹{watch("video_fee") ? (watch("video_fee") * 0.8).toFixed(2) : "0.00"}
            </Text>
          </FormControl>
        )}

        <Divider my={3} />

        {/* Emergency Appointment Section */}
        <FormControl display="flex" alignItems="center" mb={2}>
          <FormLabel mb="0">Emergency Appointment - </FormLabel>
          <Switch
            isChecked={appointments.emergency_appointment === 1}
            onChange={() => handleToggle("emergency_appointment")}
            size={"sm"}
          />
        </FormControl>
        {appointments.emergency_appointment === 1 && (
          <FormControl mt={3}>
            <FormLabel>Emergency Fee</FormLabel>
            <Input
              size="sm"
              borderRadius={6}
              type="number"
              placeholder="Emergency Fee"
              {...register("emg_fee", {
                onChange: (e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setValue("emg_earning", value * 0.8);
                }
              })}
              defaultValue={doctorDetails?.emg_fee}
            />
            <Text fontSize="xs" color="green.600" mt={1}>
              Your earnings: ₹{watch("emg_fee") ? (watch("emg_fee") * 0.8).toFixed(2) : "0.00"}
            </Text>
          </FormControl>
        )}
      </CardBody>
    </Card>
  );
};

const IsActiveSwitch = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.active);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;
          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};

const StopBooking = ({ id, isStop_booking }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const handleActive = async (id, stop_booking) => {
    let data = { id, stop_booking };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.stop_booking);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isStop_booking === 1}
        size={"sm"}
        onChange={(e) => {
          let stop_booking = e.target.checked ? 1 : 0;
          mutation.mutate({ id, stop_booking });
        }}
      />
    </FormControl>
  );
};
const BestDoctor = ({ id, is_best_doctor }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const handleActive = async (id, is_best_doctor) => {
    let data = { id, is_best_doctor };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.is_best_doctor);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={is_best_doctor === 1}
        size={"sm"}
        onChange={(e) => {
          let is_best_doctor = e.target.checked ? 1 : 0;
          mutation.mutate({ id, is_best_doctor });
        }}
      />
    </FormControl>
  );
};