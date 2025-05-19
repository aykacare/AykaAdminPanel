/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Select,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
  List,
  ListItem,
  Switch
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ADD } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useLocationData from "../../Hooks/UseLocationData";
import useHasPermission from "../../Hooks/HasPermission";

export default function AddClinic() {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [profilePicture, setprofilePicture] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const { cities } = useLocationData();

  // Filter cities based on search term
  const filteredCities = cities?.filter(city =>
    city.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputRef = useRef();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setprofilePicture(selectedFile);
  };

  const AddNew = async (data) => {
    if (data.password != data.cnfPassword) {
      return showToast(toast, "error", "password does not match");
    }

    let formData = {
      image: profilePicture,
      ...data,
    };

    console.log(formData);

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_clinic", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Clinic Added!");
        queryClient.invalidateQueries("clinics");
        reset();
        navigate(`/clinic/update/${res.id}`);
      } else {
        console.log(res);
        ShowToast(toast, "error", `${res.message} - ${res.response}`);
      }
    } catch (error) {
      console.log(error);
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleCitySelect = (cityId, cityName) => {
    setValue("city_id", cityId);
    setSearchTerm(cityName);
    setShowCityDropdown(false);
  };

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Text fontSize={20} fontWeight={500}>
          Add Clinic
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

      <Flex gap={10}>
        <Box w={"70%"} as={"form"} onSubmit={handleSubmit(AddNew)}>
          <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
            <CardBody p={3}>
              <Heading size={"md"} fontWeight={"md"}>
                Basic Details -{" "}
              </Heading>
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
                <FormControl display="flex" alignItems="center" mb={4} gap={3}>
                  <FormLabel htmlFor="is_best_clinic" mb="0" fontSize="sm">
                    Promote Clinic?
                  </FormLabel>
                  <Switch
                    id="is_best_clinic"
                    size="sm"
                    isChecked={watch("is_best_clinic") === 1}
                    onChange={(e) => setValue("is_best_clinic", e.target.checked ? 1 : 0)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>City</FormLabel>
                  <Box position="relative">
                    <Input
                      placeholder="Search cities..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    />
                    {showCityDropdown && (
                      <Box
                        position="absolute"
                        width="100%"
                        mt={1}
                        bg={useColorModeValue("white", "gray.700")}
                        boxShadow="md"
                        borderRadius="md"
                        zIndex={1}
                        maxH="300px"
                        overflowY="auto"
                        border="1px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                      >
                        <List spacing={1}>
                          {filteredCities?.length > 0 ? (
                            filteredCities.map((city) => (
                              <ListItem
                                key={city.id}
                                px={3}
                                py={2}
                                cursor="pointer"
                                _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                                onClick={() => handleCitySelect(city.id, city.title)}
                              >
                                <Text >{city.title}</Text>
                              </ListItem>
                            ))
                          ) : (
                            <ListItem px={3} py={2}>
                              <Text color="gray.500">No cities found</Text>
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    )}
                  </Box>
                </FormControl>
                <FormControl>
                  <FormLabel>Google Map Location URL</FormLabel>
                  <Input
                    type="url"
                    placeholder="https://www.google.com/maps/place/..."
                    {...register("google_map_location_url", {
                      pattern: {
                        value: /^(https?:\/\/)?(www\.)?google\.[a-z.]+\/maps\/.+$/i,
                        message: "Please enter a valid Google Maps URL",
                      },
                    })}
                  />
                </FormControl>
              </Flex>
            </CardBody>
          </Card>

          <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
            <CardBody p={3}>
              <Heading size={"md"} fontWeight={"md"}>
                Clinic Admin Details -{" "}
              </Heading>
              <Divider my={3} />

              <Flex gap={10}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    w={300}
                    type="email"
                    placeholder="Email"
                    {...register("email", { required: true })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...register("password", { required: true })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="text"
                    placeholder="Password"
                    {...register("cnfPassword", { required: true })}
                  />
                </FormControl>
              </Flex>
              <Flex gap={10} mt={5}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    placeholder="First Name"
                    {...register("f_name", { required: true })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    placeholder="Last Name"
                    {...register("l_name", { required: true })}
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
            Add
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
                  profilePicture
                    ? URL.createObjectURL(profilePicture)
                    : "/admin/imagePlaceholder.png"
                }
              />
              {profilePicture && (
                <Tooltip label="Clear" fontSize="md">
                  <CloseButton
                    colorScheme="red"
                    variant={"solid"}
                    position={"absolute"}
                    right={2}
                    onClick={() => {
                      setprofilePicture(null);
                    }}
                  />
                </Tooltip>
              )}
            </Flex>
            <VStack spacing={4} align="stretch" mt={10}>
              <Input
                type="file"
                display="none"
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
              >
                Upload Profile Picture
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
}

// const BestClinicToggle = ({ is_best_clinic, setBestClinic }) => {
//   const { hasPermission } = useHasPermission();

//   return (
//     <FormControl display="flex" alignItems="center">
//       <Switch
//         isDisabled={!hasPermission("DOCTOR_CREATE")}
//         isChecked={is_best_clinic === 1}
//         size="sm"
//         onChange={(e) => {
//           const checked = e.target.checked ? 1 : 0;
//           setBestClinic(checked);
//         }}
//       />
//     </FormControl>
//   );
// };
