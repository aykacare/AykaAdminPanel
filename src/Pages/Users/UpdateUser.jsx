﻿/* eslint-disable react-hooks/rules-of-hooks */
import { AiOutlineDown } from "react-icons/ai";
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
  Select,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ADD, GET, UPDATE } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
import Loading from "../../Components/Loading";
import ISDCODEMODAL from "../../Components/IsdModal";
import { FaTrash } from "react-icons/fa";
import VitalsData from "./VitalsData";
import FamilyMembersByUser from "../Family-Members/FamilyMembersByUser";
import todayDate from "../../Controllers/today";
import Wallet from "../Wallet/Wallet";
import { walletMinAmount } from "../../Controllers/Wallet";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import UseClinicsData from "../../Hooks/UseClinicsData";
import DeleteAssignRole from "../Roles/DeleteAssignRole";
import UserAssignRole from "./UserAssignRole";

export default function UpdateUser() {
  const { id } = useParams();
  const { hasPermission } = useHasPermission();
  if (!hasPermission("USER_UPDATE")) return <NotAuth />;
  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Family Members</Tab>
          <Tab>Family Vitals Data</Tab>
          <Tab>Wallet</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <UserDetails />
          </TabPanel>
          <TabPanel px={0}>
            <FamilyMembersByUser userID={id} />
          </TabPanel>
          <TabPanel px={0}>
            <VitalsData />
          </TabPanel>
          <TabPanel px={0}>
            <Wallet userID={id} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const handlePasswordChange = async (data) => {
  const res = await UPDATE(admin.token, "update_password", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function UserDetails() {
  const param = useParams();
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [password, setpassword] = useState();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  // assignRole
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const {
    isOpen: AssignisOpen,
    onOpen: AssignonOpen,
    onClose: AssignonClose,
  } = useDisclosure();

  // get doctor details

  const { data: userDetails, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", param.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_user/${param.id}`);
      setisd_code(res.data.isd_code);
      return res.data;
    },
  });

  const [isd_code, setisd_code] = useState(userDetails?.isd_code || undefined);

  const AddNew = async (data) => {
    if (data.password && data.password != data.cnfPassword) {
      return showToast(toast, "error", "password does not match");
    }
    let formData = {
      id: param.id,
      isd_code,
      clinic_id: selectedClinicID?.id || userDetails.clinic_id,
      ...data,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_user", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Updated!");
        queryClient.invalidateQueries(["user", param.id]);
        queryClient.invalidateQueries("users");
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
      const res = await ADD(admin.token, "update_user", {
        id: param.id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Updated!");
        queryClient.invalidateQueries(["user", param.id]);
        queryClient.invalidateQueries("users");
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

  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_user_image", {
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

  const paswordChngMutate = useMutation({
    mutationFn: async (data) => {
      await handlePasswordChange(data);
    },
    onSuccess: () => {
      setpassword("");
      ShowToast(toast, "success", "Success");
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  if (isUserLoading || isLoading) return <Loading />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Flex alignItems={"center"} gap={3}>
          {" "}
          <Heading as={"h1"} size={"lg"}>
            {admin.id === param.id ? "Admin Details" : "User Details"}
          </Heading>{" "}
          <Badge
            p={1}
            px={3}
            fontSize="sm"
            textAlign="center"
            borderRadius={6}
            colorScheme={
              userDetails.wallet_amount < walletMinAmount ? "red" : "green"
            }
            my={2}
          >
            Wallet Amount - {userDetails.wallet_amount}
          </Badge>
          <Button
            size={"sm"}
            variant={"outline"}
            ml={5}
            colorScheme={userDetails.role_id ? "red" : "blue"}
            onClick={() => {
              if (userDetails.role_id) {
                DeleteonOpen();
              } else {
                AssignonOpen();
              }
            }}
          >
            {userDetails.role_id
              ? `Delete Assigned Role - ${userDetails?.role_name}`
              : "Assign a Role"}
          </Button>
        </Flex>
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

      <Flex gap={10}>
        <Card mt={5} bg={useColorModeValue("white", "gray.700")} w={"70%"}>
          <CardBody p={3} as={"form"} onSubmit={handleSubmit(AddNew)}>
            <Flex gap={10}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  placeholder="First Name"
                  {...register("f_name", { required: true })}
                  defaultValue={userDetails.f_name}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  placeholder="Last Name"
                  {...register("l_name", { required: false })}
                  defaultValue={userDetails.l_name}
                />
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  defaultValue={userDetails.email}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    cursor={"pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen();
                    }}
                  >
                    {isd_code || userDetails?.isd_code}{" "}
                    <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="phone Number"
                    {...register("phone", {
                      required: true,
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]*$/g,
                    })}
                    defaultValue={userDetails.phone}
                  />
                </InputGroup>
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl>
                <FormLabel>Date Of Birth (MM/DD/YYYY)</FormLabel>
                <Input
                  max={todayDate()}
                  placeholder="Select Date"
                  size="md"
                  type="date"
                  {...register("dob", { required: false })}
                  defaultValue={userDetails.dob}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Select
                  placeholder="Select Gender"
                  {...register("gender", { required: false })}
                  defaultValue={userDetails.gender}
                >
                  <option value="Female">Female</option>{" "}
                  <option value="Male">Male</option>
                </Select>
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl>
                <FormLabel>Clinic</FormLabel>
                <ClinicComboBox
                  data={clinicsData}
                  name={"clinic"}
                  defaultData={userDetails.clinic_id}
                  setState={setselectedClinicID}
                  isDisabled
                />
              </FormControl>
            </Flex>
            <Button
              w={"100%"}
              mt={10}
              type="submit"
              colorScheme="green"
              size={"sm"}
              isLoading={isLoading}
            >
              Update
            </Button>
            <>
              {" "}
              <Divider py={2} mb={2} />
              <Heading as={"h1"} size={"sm"}>
                Update password -
              </Heading>{" "}
              <Flex gap={10} mt={5} align={"flex-end"}>
                <FormControl w={300}>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    value={password}
                    type="password"
                    placeholder="Enter New Password . . ."
                    onChange={(e) => {
                      setpassword(e.target.value);
                    }}
                  />
                </FormControl>
                <Button
                  colorScheme={"blue"}
                  onClick={() => {
                    let user_id = param.id;
                    paswordChngMutate.mutate({
                      user_id,
                      password,
                    });
                  }}
                  isLoading={paswordChngMutate.isPending}
                >
                  Update Password
                </Button>
              </Flex>
            </>
          </CardBody>
        </Card>
        <Card
          mt={5}
          bg={useColorModeValue("white", "gray.700")}
          w={"25%"}
          h={"fit-content"}
          pb={10}
        >
          <CardBody p={2}>
            <Text textAlign={"center"}>Profile Picture</Text>
            <Divider></Divider>
            <Flex p={2} justify={"center"} mt={5} position={"relative"}>
              <Image
                borderRadius={"50%"}
                h={200}
                objectFit={"cover"}
                w={200}
                src={
                  userDetails?.image
                    ? `${imageBaseURL}/${userDetails?.image}`
                    : "/admin/profilePicturePlaceholder.png"
                }
              />
              {userDetails?.image && (
                <Tooltip label="Clear" fontSize="md">
                  <IconButton
                    size={"sm"}
                    colorScheme="red"
                    variant={"solid"}
                    position={"absolute"}
                    right={5}
                    icon={<FaTrash />}
                    onClick={() => {
                      handleFileDelete();
                    }}
                  />
                </Tooltip>
              )}
            </Flex>
            <VStack spacing={4} align="stretch" mt={10}>
              <Input
                type="file"
                display="none" // Hide the actual file input
                ref={inputRef}
                onChange={handleFileChange}
                accept=".jpeg, .svg, .png , .jpg"
              />
              <Button
                isDisabled={userDetails?.image !== null}
                size={"sm"}
                onClick={() => {
                  inputRef.current.click();
                }}
                colorScheme="blue"
              >
                Change Profile Picture
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Flex>

      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setisd_code}
      />

      {DeleteisOpen && (
        <DeleteAssignRole
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={{
            id: userDetails?.role_assign_id,
            userID: param.id,
            role_name: userDetails?.role_name,
            name: `${userDetails?.f_name} ${userDetails?.l_name}`,
          }}
        />
      )}
      {AssignisOpen && (
        <UserAssignRole
          isOpen={AssignisOpen}
          onClose={AssignonClose}
          userID={param.id}
        />
      )}
    </Box>
  );
}
