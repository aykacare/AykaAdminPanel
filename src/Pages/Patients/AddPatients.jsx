/* eslint-disable react/prop-types */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Grid,
  Select,
  useDisclosure,
  InputGroup,
  InputLeftAddon,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import ISDCODEMODAL from "../../Components/IsdModal";
import { useState } from "react";
import { AiOutlineDown } from "react-icons/ai";
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADD } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";
import todayDate from "../../Controllers/today";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import UseClinicsData from "../../Hooks/UseClinicsData";

const addPatient = async (data) => {
  const res = await ADD(admin.token, "add_patient", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function AddPatients({ nextFn, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { register, handleSubmit, reset, watch } = useForm();
  const [isd_code, setisd_code] = useState("+91");
  const {
    isOpen: isIsdOpen,
    onOpen: onIsdOpen,
    onClose: onIsdClose,
  } = useDisclosure();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await addPatient(data);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error));
    },
    onSuccess: () => {
      if (nextFn) {
        nextFn({
          f_name: watch("f_name"),
          l_name: watch("l_name"),
          phone: watch("phone"),
        });
      }
      ShowToast(toast, "success", "Patient Added");
      queryClient.invalidateQueries("users");
      queryClient.invalidateQueries("patients");
      onClose();
      reset();
    },
  });

  const onSubmit = (data) => {
    if (!isd_code) {
      return ShowToast(toast, "error", "Select ISD Code");
    }
    if (!selectedClinicID) {
      return ShowToast(toast, "error", "Select Clinic");
    }
    let formData = {
      ...data,
      isd_code,
      dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : "",
      clinic_id: selectedClinicID.id,
    };

    mutation.mutate(formData);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"2xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent borderRadius={8} overflow={"hidden"} zIndex={99999999}>
          <ModalHeader py={1} fontSize={"md"} bg={"blue.700"} color={"#fff"}>
            Add Patient
          </ModalHeader>
          <ModalCloseButton top={0} color={"#fff"} />
          <Divider />

          <ModalBody>
            <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={3}>
              <FormControl isRequired>
                <FormLabel>Clinic</FormLabel>
                <ClinicComboBox
                  data={clinicsData}
                  name={"clinic"}
                  defaultData={selectedClinic}
                  setState={setselectedClinicID}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  size="md"
                  {...register("f_name")}
                  placeholder="First Name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  {...register("l_name")}
                  placeholder="Last Name"
                />
              </FormControl>

              <FormControl isRequired gridcx>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    bg={"none"}
                    pl={1}
                    pr={2}
                    borderRadius={0}
                    cursor={"pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIsdOpen();
                    }}
                    fontSize={"sm"}
                  >
                    {isd_code} <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    {...register("phone", {
                      required: true,
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]*$/g,
                    })}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Gender</FormLabel>
                <Select
                  defaultValue="Male"
                  {...register("gender")}
                  placeholder="Gender"
                >
                  <option value={"Male"}>Male</option>
                  <option value={"Female"}>Female</option>
                </Select>
              </FormControl>
              <FormControl >
                <FormLabel>Date of Birth</FormLabel>
                <Input max={todayDate()} type="date" {...register("dob")} />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
              Close
            </Button>
            <Button
              colorScheme={"blue"}
              size={"sm"}
              type="submit"
              isLoading={mutation.isPending}
            >
              Add Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
      <ISDCODEMODAL
        isOpen={isIsdOpen}
        onClose={onIsdClose}
        setisd_code={setisd_code}
      />
    </Modal>
  );
}

export default AddPatients;
