import { FaImages } from "react-icons/fa";
import { RiUserShared2Fill } from "react-icons/ri";
import { FaListAlt } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { SiContactlesspayment } from "react-icons/si";
import { FaLocationArrow } from "react-icons/fa";
import { BiClinic } from "react-icons/bi";
import { IoIosNotifications } from "react-icons/io";
import { BiCalendar } from "react-icons/bi";
/* eslint-disable react-hooks/rules-of-hooks */
import {
  MdFamilyRestroom,
  MdMobileScreenShare,
  MdRateReview,
} from "react-icons/md";
import { BiFolderOpen } from "react-icons/bi";
import { RiCoupon2Fill, RiStethoscopeFill } from "react-icons/ri";
import { BiCheckShield } from "react-icons/bi";
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { CgArrowsExchangeAlt } from "react-icons/cg";
import { FiSettings } from "react-icons/fi";
import {
  FaFileAlt,
  FaHospitalUser,
  FaMedkit,
  FaPills,
  FaUserMd,
} from "react-icons/fa";
import { AiFillContacts, AiOutlineSearch } from "react-icons/ai";
import { MdAdminPanelSettings } from "react-icons/md";
import { ImUsers } from "react-icons/im";
import { AiFillDashboard } from "react-icons/ai";
import { FaHospital } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Tooltip,
  useColorModeValue,
  useMediaQuery,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import admin from "../Controllers/admin";
import useSettingsData from "../Hooks/SettingData";
import { BsBookmarkStar } from "react-icons/bs";
import useHasPermission from "../Hooks/HasPermission";
import { motion, AnimatePresence } from "framer-motion";

const getLinkSections = (isSuperAdmin) => {
  const baseSections = [
    {
      section: "Dashboard",
      links: [{ name: "Dashboard", icon: AiFillDashboard, superadmin: true }],
    },
    {
      section: "Appointments & Checkins",
      links: [
        { name: "Checkins", icon: BiCheckShield, permission: "CHECKIN_VIEW" },
        {
          name: "Appointments",
          icon: RiStethoscopeFill,
          permission: "APPOINTMENT_VIEW",
          superadmin: true,
        },
        {
          name: "Appointment-Status-Log",
          icon: FaListAlt,
          permission: "APPOINTMENT_VIEW",
        },
        {
          name: "Appointments-Calender",
          icon: BiCalendar,
          permission: "APPOINTMENT_VIEW",
        },
      ],
    },
    {
      section: "Finance",
      links: [
        {
          name: "Transactions",
          icon: CgArrowsExchangeAlt,
          permission: "ALL_TRANSACTION_VIEW",
        },
        {
          name: "Payments",
          icon: SiContactlesspayment,
          permission: "ALL_TRANSACTION_VIEW",
        },
        {
          name: "Invoices",
          icon: FaFileInvoiceDollar,
          permission: "ALL_TRANSACTION_VIEW",
        },
      ],
    },
    {
      section: isSuperAdmin ? "Clinic" : "Clinics & Doctors",
      links: [
        {
          name: "Clinics",
          icon: BiClinic,
          permission: "CLINIC_VIEW",
          superadmin: true,
        },
        {
          name: "Doctors",
          icon: FaUserMd,
          permission: "DOCTOR_VIEW",
          superadmin: true,
        },
        {
          name: "Departments",
          icon: FaHospital,
          permission: "DEPARTMENT_VIEW",
          superadmin: true,
        },
        {
          name: "Specialization",
          icon: FaMedkit,
          permission: "SPECIALIZATION_VIEW",
          superadmin: true,
        },
      ],
    },
    {
      section: "Patients & Users",
      links: [
        {
          name: "Patients",
          icon: FaHospitalUser,
          permission: "PATIENT_VIEW",
          superadmin: true,
        },
        {
          name: "Family-Members",
          icon: MdFamilyRestroom,
          permission: "FAMILY_VIEW",
          superadmin: true,
        },
        { name: "Users", icon: ImUsers, permission: "USER_VIEW" },
        {
          name: "Patient-Refer",
          icon: RiUserShared2Fill,
          permission: "REFER_VIEW",
        },
      ],
    },
    {
      section: "Prescriptions & Files",
      links: [
        {
          name: "Prescriptions",
          icon: FaFileAlt,
          permission: "PRESCRIPTION_VIEW",
        },
        { name: "Patient-Files", icon: BiFolderOpen, permission: "FILE_VIEW" },
      ],
    },
    {
      section: "Medicines",
      links: [
        { name: "Medicines", icon: FaPills, permission: "MEDICINE_VIEW" },
      ],
    },
    {
      section: "Promo",
      links: [
        {
          name: "Banners",
          icon: FaImages,
          permission: "BANNER_VIEW",
          superadmin: true,
        },
        { name: "Coupons", icon: RiCoupon2Fill, permission: "COUPON_VIEW" },
        {
          name: "Doctor-Reviews",
          icon: BsBookmarkStar,
          permission: "REVIEW_VIEW",
        },
        {
          name: "Testimonials",
          icon: MdRateReview,
          permission: "TESTIMONIAL_VIEW",
        },
      ],
    },
    {
      section: "Notifications & Settings",
      links: [
        {
          name: "Contact-Us-Form",
          icon: AiFillContacts,
          permission: "CONTACT_AS_VIEW",
        },
        {
          name: "Notification",
          icon: IoIosNotifications,
          permission: "NOTIFICATION_VIEW",
        },
        {
          name: "Login-Screen",
          icon: MdMobileScreenShare,
          permission: "LOGINSCREEN_VIEW",
        },
        ...(isSuperAdmin
          ? [
              {
                name: "Roles",
                icon: MdAdminPanelSettings,
                permission: "ROLE_VIEW",
              },
              {
                name: "Location-Settings",
                icon: FaLocationArrow,
                permission: "LOCATION_VIEW",
              },
              {
                name: "Settings",
                icon: FiSettings,
                permission: "SETTING_VIEW",
              },
            ]
          : []),
      ],
    },
  ];

  return isSuperAdmin
    ? baseSections.map((section) => ({
        ...section,
        links: section.links,
      }))
    : baseSections.map((section) => ({
        ...section,
        links: section.links.filter(
          (link) =>
            !["Roles", "Settings", "Location-Settings"].includes(link.name)
        ),
      }));
};

export default function Sidebar() {
  const [isLarge] = useMediaQuery("(min-width: 998px)");
  const Uselocation = useLocation();
  const location = Uselocation.pathname.split("/")[1];
  const [isOpen, setisOpen] = useState(!isLarge);
  const [activeTab, setActiveTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const { hasPermission } = useHasPermission();
  const { settingsData } = useSettingsData();
  const title = settingsData?.find((value) => value.id_name === "clinic_name");
  const isSuperAdmin = admin?.role?.name?.toLowerCase() === "super admin";
  const LinkSections = getLinkSections(isSuperAdmin);

  const filteredSections = LinkSections.map((section) => {
    const filteredLinks = section.links?.filter((link) =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredLinks?.length) {
      return {
        ...section,
        links: filteredLinks,
      };
    }
    return null;
  }).filter(Boolean);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleTabClick(location ? location : "Dashboard");
  }, [location]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const getDefaultExpandedIndices = () => {
    const indices = [];

    if (filteredSections.some((section) => section.section === "Dashboard")) {
      indices.push(0);
    }

    filteredSections.forEach((section, index) => {
      if (
        section.links.some(
          (link) => link.name.toLowerCase() === location?.toLowerCase()
        )
      ) {
        indices.push(index);
      }
    });

    return [...new Set(indices)];
  };

  return (
    <Box
      maxH="100vh"
      minH={"100vh"}
      overflowY={"scroll"}
      sx={{
        "::-webkit-scrollbar": { display: "none" },
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
      }}
    >
      <motion.div
        initial={{ width: 64 }}
        animate={{ width: isOpen ? 256 : 64 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          minHeight: "100vh",
          overflow: "hidden",
          backgroundColor: "#1a202c",
          color: "#FFF",
          borderRight: "1px solid #2D3748",
        }}
      >
        <Box
          bg={"main.900"}
          overflow={"hidden"}
          minH="100vh"
          borderRightColor={useColorModeValue("gray.200", "gray.700")}
          color={"#FFF"}
          transition={"0.4s ease"}
        >
          <Flex
            h="16"
            alignItems="center"
            mx={isOpen ? 4 : 2}
            justifyContent={isOpen ? "space-between" : "center"}
          >
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Text
                    fontSize="xl"
                    fontFamily="monospace"
                    fontWeight="semi-bold"
                  >
                    {title?.value || admin?.role.name}
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>
            <IconButton
              onClick={() => setisOpen(!isOpen)}
              icon={<GiHamburgerMenu fontSize="20" />}
              color={"#fff"}
              background={"none"}
              _hover={{ background: "none" }}
            />
          </Flex>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box p={2} pt={0} mb={4}>
                  <InputGroup size={"sm"} colorScheme="blackAlpha">
                    <InputRightElement pointerEvents="none">
                      <AiOutlineSearch size={"20"} />
                    </InputRightElement>
                    <Input
                      onChange={handleSearchChange}
                      focusBorderColor="#fff"
                      placeholder="Search"
                      borderRadius={8}
                      borderColor={"#fff"}
                      _placeholder={{ color: "#fff" }}
                    />
                  </InputGroup>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {isOpen ? (
            <Accordion allowMultiple defaultIndex={getDefaultExpandedIndices()}>
              {filteredSections.map((section) => {
                const hasAnyLinkPermission =
                  section.section.toLowerCase() === "dashboard"
                    ? true
                    : section.links &&
                      section.links.some((link) =>
                        hasPermission(link.permission)
                      );

                return hasAnyLinkPermission ? (
                  <AccordionItem key={section.section} border="none">
                    <AccordionButton
                      px={isOpen ? 4 : 2}
                      py={3}
                      _hover={{ bg: "main.400" }}
                      justifyContent={isOpen ? "space-between" : "center"}
                    >
                      <Flex align="center" gap={isOpen ? 3 : 0}>
                        {section.links[0]?.icon && !isOpen && (
                          <Icon as={section.links[0].icon} fontSize={20} />
                        )}
                        {isOpen && (
                          <Text fontSize="sm" fontWeight="bold">
                            {section.section}
                          </Text>
                        )}
                      </Flex>
                      {isOpen && <AccordionIcon />}
                    </AccordionButton>

                    <AccordionPanel pb={4} px={isOpen ? 4 : 0}>
                      {section.links &&
                        section.links.map((link) =>
                          link.name.toLowerCase() === "dashboard" ||
                          hasPermission(link.permission) ? (
                            <Box
                              key={link.name}
                              as={Link}
                              to={`/${link.name.toLowerCase()}`}
                              display="block"
                              onClick={() =>
                                handleTabClick(link.name.toLowerCase())
                              }
                              mb={1}
                            >
                              <Flex
                                align="center"
                                p={2}
                                borderRadius={isOpen ? "lg" : "none"}
                                bg={
                                  link.name.toLowerCase() === activeTab
                                    ? "main.400"
                                    : "transparent"
                                }
                                _hover={{ bg: "main.400" }}
                                gap={isOpen ? 3 : 0}
                                justifyContent={isOpen ? "start" : "center"}
                              >
                                {link.icon && (
                                  <Icon
                                    as={link.icon}
                                    fontSize={isOpen ? 16 : 20}
                                  />
                                )}
                                {isOpen && (
                                  <Text fontSize={14}>{link.name}</Text>
                                )}
                              </Flex>
                            </Box>
                          ) : null
                        )}
                    </AccordionPanel>
                  </AccordionItem>
                ) : null;
              })}
            </Accordion>
          ) : (
            <Box>
              {filteredSections.map((section) => {
                const hasAnyLinkPermission =
                  section.section.toLowerCase() === "dashboard"
                    ? true
                    : section.links &&
                      section.links.some((link) =>
                        hasPermission(link.permission)
                      );

                return hasAnyLinkPermission ? (
                  <Box key={section.section} border="none">
                    <Box>
                      {section.links &&
                        section.links.map((link) =>
                          link.name.toLowerCase() === "dashboard" ||
                          hasPermission(link.permission) ? (
                            <Tooltip
                              label={isOpen ? null : link.name}
                              placement="right"
                              key={link.name}
                            >
                              <Box
                                as={Link}
                                to={`/${link.name.toLowerCase()}`}
                                display="block"
                                onClick={() =>
                                  handleTabClick(link.name.toLowerCase())
                                }
                                mb={3}
                              >
                                <Flex
                                  align="center"
                                  p={2}
                                  borderRadius={isOpen ? "lg" : "none"}
                                  bg={
                                    link.name.toLowerCase() === activeTab
                                      ? "main.400"
                                      : "transparent"
                                  }
                                  _hover={{ bg: "main.400" }}
                                  gap={isOpen ? 3 : 0}
                                  justifyContent={isOpen ? "start" : "center"}
                                >
                                  {link.icon && (
                                    <Icon
                                      as={link.icon}
                                      fontSize={isOpen ? 16 : 20}
                                    />
                                  )}
                                  {isOpen && (
                                    <Text fontSize={14}>{link.name}</Text>
                                  )}
                                </Flex>
                              </Box>
                            </Tooltip>
                          ) : null
                        )}
                    </Box>
                  </Box>
                ) : null;
              })}
            </Box>
          )}
        </Box>
      </motion.div>
    </Box>
  );
}
