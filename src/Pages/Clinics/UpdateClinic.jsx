import { BiLinkExternal } from "react-icons/bi";
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  IconButton,
  Image,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DELETE, GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useLocationData from "../../Hooks/UseLocationData";
import Loading from "../../Components/Loading";
import { FaTrash } from "react-icons/fa";
import imageBaseURL from "../../Controllers/image";
import GalleryImages from "./GalleryImages";
const handleUpdate = async (data) => {
  const res = await UPDATE(admin.token, "update_clinic", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};
const handleFileDelete = async (data) => {
  const res = await DELETE(admin.token, "remove_clinic_image", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

export default function UpdateClinic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { cities } = useLocationData();
  const inputRef = useRef();

  const { data: clinicData, isLoading: isClinicLoading } = useQuery({
    queryKey: ["clinic", id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_clinic/${id}`);
      if (res.response !== 200) {
        throw new Error(res.message);
      }
      return res.data;
    },
  });

  useEffect(() => {
    clinicData &&
      Object.keys(clinicData).forEach((key) => {
        setValue(key, clinicData[key]);
      });
  }, [clinicData, setValue]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Clinic Updated!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      let data = {
        id: id,
      };
      await handleFileDelete(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Removed!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    let formData = {
      id: id,
      image: selectedFile,
    };
    mutation.mutate(formData);
  };

  const submitForm = (data) => {
    let formData = {
      ...data,
      id: id,
    };
    mutation.mutate(formData);
  };

  if (isClinicLoading) return <Loading />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Text fontSize={20} fontWeight={500}>
          Update Clinic
        </Text>
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

      <Tabs>
        <TabList>
          <Tab>Basic Details</Tab>
          <Tab>Gallery Images</Tab>
          <Tab>Opening Hours</Tab>
          <Tab>Contact</Tab>
          <Tab>Setting</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Flex gap={10}>
              <Box w={"70%"} as={"form"} onSubmit={handleSubmit(submitForm)}>
                {" "}
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading size={"md"} fontWeight={"md"}>
                        Basic Details -{" "}
                      </Heading>
                      <Button
                        rightIcon={<BiLinkExternal />}
                        size={"sm"}
                        colorScheme={"whatsapp"}
                        as={Link}
                        to={`/user/update/${clinicData.user_id}`}
                      >
                        Admin Details
                      </Button>
                    </Flex>

                    <Divider my={3} />
                    <Flex gap={10}>
                      <FormControl isRequired>
                        <FormLabel>Title</FormLabel>
                        <Input
                          type="text"
                          placeholder="Title"
                          {...register("title", { required: true })}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Active</FormLabel>
                        <Select
                          isRequired
                          {...register("active", { required: true })}
                          isDisabled={
                            clinicData?.active.toString() === "0" &&
                            admin.role.name.toLowerCase() !== "super admin"
                          }
                        >
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </Select>
                        {clinicData?.active.toString() === "0" &&
                          admin.role.name.toLowerCase() !== "super admin" && (
                            <FormHelperText color="red.500">
                              Only Super Admin can activate this account.
                            </FormHelperText>
                          )}
                      </FormControl>
                    </Flex>
                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>City</FormLabel>
                        <Select
                          placeholder="Select City"
                          isRequired
                          {...register("city_id", { required: true })}
                        >
                          {cities?.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.title}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>State</FormLabel>
                        <Input
                          type="Text"
                          placeholder="State"
                          {...register("state_title", { required: true })}
                          isReadOnly
                        />
                      </FormControl>
                    </Flex>
                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Latitude</FormLabel>
                        <Input
                          type="text"
                          placeholder="Latitude"
                          {...register("latitude", {
                            pattern: /^-?\d+(\.\d+)?$/,
                          })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Longitude</FormLabel>
                        <Input
                          type="text"
                          placeholder="Longitude"
                          {...register("longitude", {
                            pattern: /^-?\d+(\.\d+)?$/,
                          })}
                        />
                      </FormControl>
                    </Flex>
                    <Flex mt={5}>
                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Textarea
                          type="text"
                          placeholder="Address"
                          {...register("address", { required: false })}
                        />
                      </FormControl>
                    </Flex>
                    <Flex mt={5}>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          type="text"
                          placeholder="Description"
                          {...register("description", { required: false })}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>{" "}
                <Button
                  w={"100%"}
                  mt={5}
                  type="submit"
                  colorScheme="green"
                  size={"md"}
                  isLoading={mutation.isPending}
                >
                  Update
                </Button>
              </Box>
              <Card
                mt={5}
                bg={useColorModeValue("white", "gray.700")}
                w={"25%"}
                h={"fit-content"}
                pb={10}
              >
                <CardBody p={2}>
                  <Text textAlign={"center"}>Image / Thumbnail</Text>
                  <Divider></Divider>
                  <Flex p={2} justify={"center"} mt={5} position={"relative"}>
                    <Image
                      h={200}
                      objectFit={"cover"}
                      w={200}
                      src={
                        clinicData?.image
                          ? `${imageBaseURL}/${clinicData?.image}` // Use profilePicture
                          : "/admin/imagePlaceholder.png" // Fallback placeholder image
                      }
                    />
                    {clinicData?.image && (
                      <Tooltip label="Delete" fontSize="md">
                        <IconButton
                          size={"sm"}
                          colorScheme="red"
                          variant={"solid"}
                          position={"absolute"}
                          right={5}
                          icon={<FaTrash />}
                          isLoading={deleteMutation.isPending}
                          onClick={() => {
                            deleteMutation.mutate();
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
                      size={"sm"}
                      onClick={() => {
                        inputRef.current.click();
                      }}
                      colorScheme="blue"
                      isLoading={mutation.isPending}
                    >
                      Upload Image
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </Flex>
          </TabPanel>
          <TabPanel p={0}>
            <GalleryImages data={clinicData} id={id} />
          </TabPanel>
          <TabPanel p={0}>
            <OpeningHrs data={clinicData} id={id} />
          </TabPanel>
          <TabPanel p={0}>
            <Contact data={clinicData} id={id} />
          </TabPanel>
          <TabPanel p={0}>
            <Setting data={clinicData} id={id} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const OpeningHrs = ({ data, id }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const openingHour = data.opening_hours ? JSON.parse(data.opening_hours) : {};

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const { control, handleSubmit } = useForm({
    defaultValues: daysOfWeek.reduce((acc, day) => {
      acc[day] = openingHour?.[day] || ""; // Populate with available data or default to an empty string
      return acc;
    }, {}),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Clinic Updated!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    const formattedString = JSON.stringify(data);
    let formData = {
      opening_hours: formattedString,
      id: id,
    };
    mutation.mutate(formData);
  };

  return (
    <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
      <CardBody p={3}>
        <Flex align={"center"} justify={"space-between"}>
          <Heading size={"md"} fontWeight={"md"}>
            Opening Hrs -
          </Heading>
        </Flex>
        <Divider my={3} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid templateColumns="repeat(3, 1fr)" gap={5}>
            {daysOfWeek.map((day) => (
              <Box key={day}>
                {/* Day Label */}
                <FormLabel
                  textTransform="capitalize"
                  minW={24}
                  alignSelf="center"
                >
                  {day} -
                </FormLabel>

                {/* Controlled Input Field */}
                <Controller
                  name={day}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g., 9am-5pm or Closed" />
                  )}
                />
              </Box>
            ))}
          </Grid>
          <Button
            colorScheme="blue"
            type="submit"
            w="full"
            mt={5}
            isLoading={mutation.isPending}
          >
            Update
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

const Contact = ({ data, id }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: data?.email || "",
      phone: data?.phone || "",
      phone_second: data?.phone_second || "",
      whatsapp: data?.whatsapp || "",
    },
  });
  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Clinic Updated!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    let formData = {
      ...data,
      id: id,
    };

    mutation.mutate(formData);
  };

  const inputs = ["email", "phone", "phone_second", "whatsapp"];
  return (
    <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
      <CardBody p={3}>
        <Flex align={"center"} justify={"space-between"}>
          <Heading size={"md"} fontWeight={"md"}>
            Contact Details -
          </Heading>
        </Flex>
        <Divider my={3} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid templateColumns="repeat(3, 1fr)" gap={5}>
            {inputs.map((name) => (
              <FormControl key={name}>
                {/* Day Label */}
                <FormLabel
                  textTransform="capitalize"
                  minW={24}
                  alignSelf="center"
                >
                  {name}
                </FormLabel>

                {/* Controlled Input Field */}
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </FormControl>
            ))}
          </Grid>
          <Button
            colorScheme="blue"
            type="submit"
            w="full"
            mt={5}
            isLoading={mutation.isPending}
          >
            Update
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};
const Setting = ({ data, id }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      ambulance_btn_enable: data?.ambulance_btn_enable || "0",
      ambulance_number: data?.ambulance_number || "",
      stop_booking: data?.stop_booking || "0",
      coupon_enable: data?.coupon_enable || "0",
      tax: data?.tax || "",
    },
  });
  console.log(data);
  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Clinic Updated!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    let formData = {
      ...data,
      id: id,
    };
    mutation.mutate(formData);
  };

  return (
    <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
      <CardBody p={3}>
        <Flex align={"center"} justify={"space-between"}>
          <Heading size={"md"} fontWeight={"md"}>
            Contact Details -
          </Heading>
        </Flex>
        <Divider my={3} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid templateColumns="repeat(3, 1fr)" gap={5}>
            <FormControl>
              <FormLabel
                textTransform="capitalize"
                minW={24}
                alignSelf="center"
              >
                ambulance number
              </FormLabel>
              <Controller
                name={"ambulance_number"}
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </FormControl>
            <FormControl>
              <FormLabel
                textTransform="capitalize"
                minW={24}
                alignSelf="center"
              >
                Ambulance Button Enable
              </FormLabel>
              <Controller
                name={"ambulance_btn_enable"}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select option"
                    value={field.value}
                  >
                    <option value="1">Enable</option>
                    <option value="0">Disable</option>
                  </Select>
                )}
              />
            </FormControl>
            <FormControl>
              <FormLabel
                textTransform="capitalize"
                minW={24}
                alignSelf="center"
              >
                stop booking
              </FormLabel>
              <Controller
                name={"stop_booking"}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select option"
                    value={field.value}
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </Select>
                )}
              />
            </FormControl>
            <FormControl>
              <FormLabel
                textTransform="capitalize"
                minW={24}
                alignSelf="center"
              >
                coupon enable
              </FormLabel>
              <Controller
                name={"coupon_enable"}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select option"
                    value={field.value}
                  >
                    <option value="1">Enable</option>
                    <option value="0">Disable</option>
                  </Select>
                )}
              />
            </FormControl>
            <FormControl>
              <FormLabel
                textTransform="capitalize"
                minW={24}
                alignSelf="center"
              >
                Tax (%)
              </FormLabel>
              <Controller
                name={"tax"}
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" min={0} />
                )}
              />
            </FormControl>
          </Grid>
          <Button
            colorScheme="blue"
            type="submit"
            w="full"
            mt={5}
            isLoading={mutation.isPending}
          >
            Update
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};
