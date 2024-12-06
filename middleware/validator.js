const Joi = require("joi");
const { min } = require("lodash");
const { ErrorHandler } = require("../helper");
const { statusCodes } = require("../helper");

const { BAD_GATEWAY } = statusCodes;

const schemas = {
  otp_generate_otp_post: Joi.object({
    mobileNumber: Joi.string()
      .length(10)
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.base": "Mobile number must be string",
        "string.length": "Mobile number must be exactly 10 digits",
        "string.pattern.base": "Invalid mobile number",
        "any.required": "Mobile number is required",
      }),
    method: Joi.string()
      .valid("register", "forgetPassword", "login")
      .required()
      .messages({
        "string.base": "Method must be string",
        "any.only":
          "Method must be either 'register' or 'forgetPassword' or 'login'",
        "any.required": "Method is required",
      }),
  }),

  otp_verify_otp_post: Joi.object({
    mobileNumber: Joi.string()
      .length(10) // Ensure the mobile number is exactly 10 digits
      .pattern(/^[6-9][0-9]{9}$/) // Ensure the mobile number starts with 6-9 and contains exactly 10 digits
      .required() // Mobile number is required
      .messages({
        "string.base": "Mobile number must be string",
        "string.length": "Mobile number must be exactly 10 digits",
        "string.pattern.base": "Invalid mobile number", // Mobile number must start with 6-9 and contain only digits
        "any.required": "Mobile number is required",
      }),
    otp: Joi.string()
      .length(6) // Ensure OTP is exactly 6 digits
      .pattern(/^[0-9]{6}$/) // Ensure OTP contains only digits
      .required() // OTP is required
      .messages({
        "string.base": "OTP must be string",
        "string.length": "OTP must be exactly 6 digits",
        "string.pattern.base": "OTP must contain only digits",
        "any.required": "OTP is required",
      }),
  }),

  // Register Schema
  auth_register_post: Joi.object({
    schoolName: Joi.string().required().messages({
      "string.base": "School name must be a string",
      "any.required": "School name is required",
    }),
    schoolUniqueId: Joi.string().optional().allow("").messages({
      "string.base": "School Unique Id must be a string",
    }),
    panNumber: Joi.string()
      .pattern(/^[A-Z]{5}\d{4}[A-Z]$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid PAN Number", // PAN number must be in the format: 5 uppercase letters, 4 digits, and 1 uppercase letter (e.g., ABCDE1234F)
        "any.required": "PAN number is required",
      }),

    tanNumber: Joi.string()
      .pattern(/^[A-Z]{4}\d{5}[A-Z]$/)
      .required()
      .messages({
        "string.pattern.base": "Inavlid TAN Number", // TAN number must be in the format: 4 uppercase letters, 5 digits, and 1 uppercase letter (e.g., ABCD12345E)
        "any.required": "TAN number is required",
      }),
    district: Joi.number().integer().required().messages({
      "number.base": "District must be a number",
      "any.required": "District is required",
    }),
    block: Joi.number().integer().required().messages({
      "number.base": "Block must be a number",
      "any.required": "Block is required",
    }),
    mobileNumber: Joi.string()
      .length(10)
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.length": "Mobile number must be exactly 10 digits",
        "string.pattern.base": "Invalid mobile number",
        "any.required": "Mobile number is required",
      }),
    affiliationBoard: Joi.number().integer().required().messages({
      "number.base": "Affiliation board must be a number",
      "any.required": "Affiliation board is required",
    }),

    trustDetails: Joi.object({
      isSchoolRunByTrust: Joi.string().valid("Yes", "No").required().messages({
        "any.only": "isSchoolRunByTrust must be 'Yes' or 'No'",
        "any.required": "isSchoolRunByTrust is required",
      }),
      registrationNumber: Joi.string().required().messages({
        "string.base": "Registration number must be a string",
        "any.required": "Registration number is required",
      }),
      isMajorityMembersSameFamily: Joi.string()
        .valid("Yes", "No")
        .required()
        .messages({
          "any.only": "isMajorityMembersSameFamily must be 'Yes' or 'No'",
          "any.required": "isMajorityMembersSameFamily is required",
        }),
      isPreEstablishedBrandName: Joi.string()
        .valid("Yes", "No")
        .required()
        .messages({
          "any.only": "isPreEstablishedBrandName must be 'Yes' or 'No'",
          "any.required": "isPreEstablishedBrandName is required",
        }),
      trustRelatedDocumentId: Joi.number().integer().required().messages({
        "number.base": "trustRelatedDocumentId must be a number",
        "any.required": "trustRelatedDocumentId is required",
      }),
    })
      .required()
      .messages({
        "any.required": "trustDetails is required",
      }),

    membersDetails: Joi.array()
      .items(
        Joi.object({
          memberName: Joi.string().required().messages({
            "string.base": "Member name must be a string",
            "any.required": "Member name is required",
          }),
          address: Joi.string().required().messages({
            "string.base": "Address must be a string",
            "any.required": "Address is required",
          }),
          occupation: Joi.string().required().messages({
            "string.base": "occupation must be a string",
            "any.required": "occupation is required",
          }),
          mobileNumber: Joi.string()
            .length(10)
            .pattern(/^[6-9]\d{9}$/)
            .required()
            .messages({
              "string.length": "Mobile number must be exactly 10 digits",
              "string.pattern.base": "Invalid mobile number",
              "any.required": "Mobile number is required",
            }),
          relationship: Joi.string().required().messages({
            "string.base": "Relationship must be a string",
            "any.required": "Relationship is required",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "At least one member must be provided in membersDetails",
        "any.required": "membersDetails is required",
      }),
  }),

  // Login Schema
  auth_login_post: Joi.object({
    username: Joi.string().required().messages({
      "string.base": "Username must be a string",
      "any.required": "Username is required",
    }),
    password: Joi.string().required().messages({
      "string.base": "Password must be a string",
      "any.required": "Password is required",
    }),
  }),

  noc_form_update_put: Joi.object({
    academicYear: Joi.number().integer().min(1).required().messages({
      "number.base": "Academic year must be a number",
      "number.min": "Academic year must be at least 1",
      "any.required": "Academic year is required",
    }),
    email: Joi.string().email().required().messages({
      "string.base": "Email must be a string",
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    correspondenceAddress: Joi.string().required().messages({
      "string.base": "Correspondence address must be a string",
      "any.required": "Correspondence address is required",
    }),
    villageCity: Joi.string().required().messages({
      "string.base": "Village/City must be a string",
      "any.required": "Village/City is required",
    }),
    pinCode: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        "string.base": "Pin code must be a string",
        "string.length": "Pin code must be exactly 6 digits long",
        "string.pattern.base": "Pin code must contain only digits",
        "any.required": "Pin code is required",
      }),
    nearestPoliceStation: Joi.string().required().messages({
      "string.base": "Nearest police station must be a string",
      "any.required": "Nearest police station is required",
    }),
    telephoneNumber: Joi.string()
      .pattern(/^[0-9]{3}-[0-9]{8}$/)
      .optional()
      .messages({
        "string.base": "Telephone number must be a string",
        "string.pattern.base":
          "Telephone number must be in the format 022-12345678",
      }),
    faxNumber: Joi.string()
      .pattern(/^[0-9]{3}-[0-9]{8}$/)
      .optional()
      .messages({
        "string.base": "Fax number must be a string",
        "string.pattern.base": "Fax number must be in the format 022-87654321",
      }),
    alternateMobileNo: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .optional()
      .messages({
        "string.base": "Alternate mobile number must be a string",
        "string.length":
          "Alternate mobile number must be exactly 10 digits long",
        "string.pattern.base":
          "Alternate mobile number must contain only digits",
      }),
  }),

  // Add Trust Details Schema
  noc_form_add_trust_details_post: Joi.object({
    trustType: Joi.string()
      .valid("trust", "society", "company")
      .when("isSchoolRunByTrust", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "any.only": "trustType must be trust, society, or company",
        "string.empty": "trustType is required when isSchoolRunByTrust is Yes",
      }),
    trustSocietyCompanyName: Joi.string().required().messages({
      "string.empty": "trustSocietyCompanyName is required",
      "any.required": "trustSocietyCompanyName is required",
    }),
    isRegisteredByCompetentAuthority: Joi.string()
      .required()
      .valid("Yes", "No")
      .messages({
        "any.only": "isRegisteredByCompetentAuthority must be Yes or No",
        "string.empty": "isRegisteredByCompetentAuthority is required",
        "any.required": "isRegisteredByCompetentAuthority is required",
      }),

    registrationDate: Joi.date().required().messages({
      "date.base": "Invalid date format",
      "any.required": "Registration date is required",
    }),
    totalMembers: Joi.number().integer().required().messages({
      "number.base": "totalMembers must be a number",
      "any.required": "totalMembers is required",
    }),

    isBrandRightsReceived: Joi.string().valid("Yes", "No").required().messages({
      "any.only": "isBrandRightsReceived must be Yes or No",
      "string.empty":
        "isBrandRightsReceived is required when isSchoolRunByTrust is Yes",
      "any.required": "isBrandRightsReceived is required",
    }),

    editFlag: Joi.boolean().optional().messages({
      "boolean.base": "Edit Flag must be a boolean",
    }),
  }),

  // Add land details schema

  noc_form_add_land_details_post: Joi.object({
    schoolLocationArea: Joi.string()
      .valid("urban", "rural", "subDistrict")
      .required()
      .messages({
        "string.base": "School Location Area must be a string",
        "any.only":
          "School Location Area must be either 'urban', 'rural', or 'subDistrict'",
        "any.required": "School Location Area is required",
      }),
    availableLandAcre: Joi.number().positive().required().messages({
      "number.base": "Available Land Acre must be a number",
      "number.positive": "Available Land Acre must be a positive number",
      "any.required": "Available Land Acre is required",
    }),
    isLandRegisteredWithDistrictOffice: Joi.string()
      .valid("Yes", "No")
      .optional()
      .messages({
        "string.base":
          "isLandRegisteredWithDistrictOffice must be either 'Yes' or 'No'",
        "any.only":
          "isLandRegisteredWithDistrictOffice must be either 'Yes' or 'No'",
      }),
    isLandAcquiredOnLease: Joi.string().valid("Yes", "No").optional().messages({
      "string.base": "isLandAcquiredOnLease must be either 'Yes' or 'No'",
      "any.only": "isLandAcquiredOnLease must be either 'Yes' or 'No'",
    }),
    leaseRegistrationNumber: Joi.when("isLandAcquiredOnLease", {
      is: true,
      then: Joi.string().required().messages({
        "string.base": "Lease Registration Number must be a string",
        "any.required":
          "Lease Registration Number is required when land is acquired on lease",
      }),
      otherwise: Joi.string().optional(),
    }),
    leaseRegistrationDate: Joi.when("isLandAcquiredOnLease", {
      is: true,
      then: Joi.date().required().messages({
        "date.base": "Lease Registration Date must be a valid date",
        "any.required":
          "Lease Registration Date is required when land is acquired on lease",
      }),
      otherwise: Joi.date().optional(),
    }),
    leaseDuration: Joi.when("isLandAcquiredOnLease", {
      is: true,
      then: Joi.number().integer().positive().required().messages({
        "number.base": "Lease Duration must be a number",
        "number.integer": "Lease Duration must be an integer",
        "number.positive": "Lease Duration must be a positive number",
        "any.required":
          "Lease Duration is required when land is acquired on lease",
      }),
      otherwise: Joi.number().optional(),
    }),
    landDocumentId: Joi.number().integer().positive().required().messages({
      "number.base": "Land Document ID must be a number",
      "number.integer": "Land Document ID must be an integer",
      "number.positive": "Land Document ID must be a positive number",
      "any.required": "Land Document ID is required",
    }),
    editFlag: Joi.boolean().optional().messages({
      "boolean.base": "Edit Flag must be a boolean",
    }),
  }),

  // add infra details schema

  noc_form_add_infra_details_post: Joi.object({
    numberOfClassrooms: Joi.number().integer().positive().required().messages({
      "number.base": "Number of classrooms must be a number",
      "number.integer": "Number of classrooms must be an integer",
      "number.positive": "Number of classrooms must be a positive number",
      "any.required": "Number of classrooms is required",
    }),
    classroomSize: Joi.string().required().messages({
      "string.base": "Classroom size must be string",
      "any.required": "Classroom size is required",
    }),
    classroomImages: Joi.array()
      .items(Joi.number().integer().positive())
      .optional()
      .messages({
        "array.base": "Classroom images must be an array of numbers",
        "array.includes":
          "Each item in classroom images must be a positive number",
      }),
    scienceLabCompositeSecondary: Joi.string()
      .valid("Yes", "No")
      .required()
      .messages({
        "string.base":
          "Science Lab Composite Secondary must be either 'Yes' or 'No'",
        "any.only":
          "Science Lab Composite Secondary must be either 'Yes' or 'No'",
        "any.required": "Science Lab Composite Secondary is required",
      }),

    scienceLabCompositeSecondaryClassrooms: Joi.number()
      .when("scienceLabCompositeSecondary", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base":
          "scienceLabCompositeSecondaryClassrooms must be a number",
        "any.required":
          "No of classrooms is required when Science Lab Composite Secondary is Yes",
      }),
    scienceLabCompositeSecondaryImages: Joi.array()
      .items(Joi.number().integer().positive())
      .optional()
      .messages({
        "array.base":
          "Science lab composite images must be an array of numbers",
        "array.includes":
          "Each item in science lab composite images must be a positive number",
      }),
    scienceLabSeparate: Joi.string().valid("Yes", "No").required().messages({
      "string.base": "Science Lab Separate must be either 'Yes' or 'No'",
      "any.only": "Science Lab Separate must be either 'Yes' or 'No'",
      "any.required": "Science Lab Separate is required",
    }),
    physicsLabClassrooms: Joi.number()
      .when("scienceLabSeparate", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "physicsLabClassrooms must be a number",
        "any.required":
          "No of physics classrooms is required when Science Lab Seperate is Yes",
      }),
    physicsLabImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("scienceLabSeparate", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Physics Lab images must be an array of numbers",
        "array.includes": "Physics images must be a positive number",
        "any.required": "Physics lab images are required",
      }),
    chemistryLabClassrooms: Joi.number()
      .when("scienceLabSeparate", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "chemistryLabClassrooms must be a number",
        "any.required":
          "No of chemistry classrooms is required when Science Lab Seperate is Yes",
      }),
    chemistryLabImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("scienceLabSeparate", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Chemistry Lab images must be an array of numbers",
        "array.includes": "Chemistry images must be a positive number",
        "any.required": "Chemistry lab images are required",
      }),
    biologyLabClassrooms: Joi.number()
      .when("scienceLabSeparate", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "biologyLabClassrooms must be a number",
        "any.required":
          "No of biology classrooms is required when Science Lab Seperate is Yes",
      }),
    biologyLabImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("scienceLabSeparate", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Biology Lab images must be an array of numbers",
        "array.includes": "Biology Lab images must be a positive number",
        "any.required": "Biology lab images are required",
      }),

    library: Joi.string().valid("Yes", "No").required().messages({
      "string.base": "Library must be either 'Yes' or 'No'",
      "any.only": "Library must be either 'Yes' or 'No'",
      "any.required": "Library is required",
    }),
    libraryRooms: Joi.number()
      .when("library", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "libraryRooms must be a number",
        "any.required": "No of rooms is required when Library is Yes",
      }),
    libraryImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("library", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Library images must be an array of numbers",
        "array.includes": "Library images must be a positive number",
        "any.required": "Library Images are required",
      }),

    computerLab: Joi.string().valid("Yes", "No").required().messages({
      "string.base": "Computer Lab must be either 'Yes' or 'No'",
      "any.only": "Computer Lab must be either 'Yes' or 'No'",
      "any.required": "Computer Lab is required",
    }),

    computerLabRooms: Joi.number()
      .when("computerLab", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "computerLabRooms must be a number",
        "any.required": "No of rooms is required when computer lab is Yes",
      }),
    computerLabImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("computerLab", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Computet Lab images must be an array of numbers",
        "array.includes": "Computer Lab images must be a positive number",
        "any.required": "Computer lab images are required.",
      }),

    mathematicsLab: Joi.string().valid("Yes", "No").required().messages({
      "string.base": "Mathematics Lab must be either 'Yes' or 'No'",
      "any.only": "Mathematics Lab must be either 'Yes' or 'No'",
      "any.required": "Mathematics Lab is required",
    }),
    mathematicsLabRooms: Joi.number()
      .when("mathematicsLab", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "mathematicsLabRooms must be a number",
        "any.required": "No of rooms is required when mathematics lab is Yes",
      }),
    mathematicsLabImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("mathematicsLab", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Mathematics Lab images must be an array of numbers",
        "array.includes": "Mathematics Lab images must be a positive number",
        "any.required": "Mathematics Lab imaged are required",
      }),
    roomsForExtracurricularActivities: Joi.string()
      .valid("Yes", "No")
      .required()
      .messages({
        "string.base":
          "Rooms for extracurricular activities must be either 'Yes' or 'No'",
        "any.only":
          "Rooms for extracurricular activities must be either 'Yes' or 'No'",
        "any.required": "Rooms for extracurricular activities is required",
      }),
    extraCurricularActivitiesClassrooms: Joi.number()
      .when("roomsForExtracurricularActivities", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "extraCurricularActivitiesClassrooms must be a number",
        "any.required":
          "No of rooms is required when extra curricular room is Yes",
      }),
    extraCurricularActivitiesImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("roomsForExtracurricularActivities", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base":
          "Extra curricular activities images must be an array of numbers",
        "array.includes":
          "Extra curricular activities images must be a positive number",
        "any.required": "Images of extracurricular activities room is required",
      }),

    drinkingWaterToiletsFacilities: Joi.string()
      .valid("Yes", "No")
      .required()
      .messages({
        "string.base":
          "Drinking water and toilet facilities must be either 'Yes' or 'No'",
        "any.only":
          "Drinking water and toilet facilities must be either 'Yes' or 'No'",
        "any.required": "Drinking water and toilet facilities are required",
      }),

    drinkingWaterRooms: Joi.number()
      .when("drinkingWaterToiletsFacilities", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "drinkingWaterRooms must be a number",
        "any.required":
          "No of drinking water rooms is required when drinking water and toilet facility  is Yes",
      }),
    drinkingWaterImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("drinkingWaterToiletsFacilities", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Drinking water images must be an array of numbers",
        "array.includes": "Drinking water images must be a positive number",
        "any.required":
          "Drinking water images are required when drinking water and toilet facility is Yes",
      }),
    toiletRooms: Joi.number()
      .when("drinkingWaterToiletsFacilities", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "toiletRooms must be a number",
        "any.required":
          "No of toilet rooms is required when drinking water and toilet facility  is Yes",
      }),
    toiletImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("drinkingWaterToiletsFacilities", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Toilet images must be an array of numbers",
        "array.includes": "Toilet images must be a positive number",
        "any.required":
          "Toilet images are required when drinking water and toilet facility is Yes",
      }),
    physicalActivityRooms: Joi.number()
      .when("drinkingWaterToiletsFacilities", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "physicalActivityRooms must be a number",
        "any.required":
          "No of physical activity rooms is required when drinking water and toilet facility  is Yes",
      }),
    physicalActivityImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("drinkingWaterToiletsFacilities", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Physical activities images must be an array of numbers",
        "array.includes":
          "Physical activities images must be a positive number",
        "any.required":
          "Physical activity images are required when drinking water and toilet facility is Yes",
      }),

    playground: Joi.string().valid("Yes", "No").required().messages({
      "string.base": "Playground must be either 'Yes' or 'No'",
      "any.only": "Playground must be either 'Yes' or 'No'",
      "any.required": "Playground is required",
    }),
    totalPlaygrounds: Joi.number()
      .when("playground", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "totalPlaygrounds must be a number",
        "any.required": "Total playground is required when playground is Yes",
      }),
    playgroundImages: Joi.array()
      .items(Joi.number().integer().positive())
      .when("playground", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Playground images must be an array of numbers",
        "array.includes": "Playground images must be a positive number",
        "any.required": "Playground images are required when playground is Yes",
      }),

    approachRoadWidth: Joi.string().required().messages({
      "string.base": "Approach road width must be a string",
      "any.required": "Approach road width is required",
    }),
    approachRoadImages: Joi.array()
      .items(Joi.number().integer().positive())
      .optional()
      .messages({
        "array.base": "Approach road images must be an array of numbers",
        "array.includes": "Approach road images must be a positive number",
      }),
    editFlag: Joi.boolean().optional().messages({
      "boolean.base": "Edit Flag must be a boolean",
    }),
  }),

  // add teacher details schema

  noc_form_add_teacher_details_post: Joi.object({
    minimumTenTeachers: Joi.string().valid("Yes", "No").required().messages({
      "string.base": "Minimum Ten Teachers must be either 'Yes' or 'No'",
      "any.only": "Minimum Ten Teachers must be either 'Yes' or 'No'",
      "any.required": "Minimum Ten Teachers is required",
    }),
    totalTeachers: Joi.number().integer().positive().required().messages({
      "number.base": "Total Teachers must be a number",
      "number.integer": "Total Teachers must be an integer",
      "number.positive": "Total Teachers must be a positive number",
      "any.required": "Total Teachers is required",
    }),
    qualifiedTeachers: Joi.number().integer().positive().required().messages({
      "number.base": "Qualified Teachers must be a number",
      "number.integer": "Qualified Teachers must be an integer",
      "number.positive": "Qualified Teachers must be a positive number",
      "any.required": "Qualified Teachers is required",
    }),
    teacherQualification: Joi.array()
      .items(
        Joi.object({
          teacherName: Joi.string().required().messages({
            "string.base": "Teacher Name must be a string",
            "any.required": "Teacher Name is required",
          }),
          teacherQualification: Joi.string().required().messages({
            "string.base": "Teacher Qualification must be a string",
            "any.required": "Teacher Qualification is required",
          }),
          appointmentDate: Joi.date().required().messages({
            "date.base": "Appointment Date must be a valid date",
            "any.required": "Appointment Date is required",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min":
          "At least one row must be provided in Teacher Qualification",
        "array.base": "Teacher Qualification must be an array",
        "any.required": "Teacher Qualification details are required",
      }),
    teacherInchargeQualification: Joi.array()
      .items(
        Joi.object({
          teacherName: Joi.string().required().messages({
            "string.base": "Teacher Name must be a string",
            "any.required": "Teacher Name is required",
          }),
          qualification: Joi.string().required().messages({
            "string.base": "Qualification must be a string",
            "any.required": "Qualification is required",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min":
          "At least one row must be provided in Teacher Incharge Qualification",
        "array.base": "Teacher Incharge Qualification must be an array",
        "any.required": "Teacher Incharge Qualification details are required",
      }),
    teacherAppointmentAdvertisement: Joi.string()
      .valid("Yes", "No")
      .required()
      .messages({
        "string.base":
          "Teacher Appointment Advertisement must be either 'Yes' or 'No'",
        "any.only":
          "Teacher Appointment Advertisement must be either 'Yes' or 'No'",
        "any.required": "Teacher Appointment Advertisement is required",
      }),
    advertisementNewspaperName: Joi.string().when(
      "teacherAppointmentAdvertisement",
      {
        is: "Yes",
        then: Joi.required().messages({
          "any.required":
            "Advertisement Newspaper Name is required when Teacher Appointment Advertisement is 'Yes'",
          "string.base": "Advertisement Newspaper Name must be a string",
        }),
        otherwise: Joi.optional(),
      }
    ),

    advertisementNewspaperDate: Joi.date()
      .iso()
      .when("teacherAppointmentAdvertisement", {
        is: "Yes",
        then: Joi.required().messages({
          "any.required":
            "Advertisement Newspaper Date is required when Teacher Appointment Advertisement is 'Yes'",
          "date.base": "Advertisement Newspaper Date must be a valid date",
          "date.format":
            "Advertisement Newspaper Date must be in ISO format (YYYY-MM-DD)",
        }),
        otherwise: Joi.optional(),
      }),
    advertisementPaperCuttingId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base": "Advertisement Paper Cutting ID must be a number",
        "number.integer": "Advertisement Paper Cutting ID must be an integer",
        "number.positive":
          "Advertisement Paper Cutting ID must be a positive number",
        "any.required": "Advertisement Paper Cutting ID is required",
      }),
    editFlag: Joi.boolean().optional().messages({
      "boolean.base": "Edit Flag must be a boolean",
    }),
  }),

  // get form data schema
  noc_form_form_data_post: Joi.object({
    schoolId: Joi.number().integer().positive().required().messages({
      "number.base": "School ID must be a number",
      "number.integer": "School ID must be an integer",
      "number.positive": "School ID must be a positive number",
      "any.required": "School ID is required",
    }),
    programCode: Joi.array()
      .items(
        Joi.string().messages({
          "string.base": "Each program code must be a string",
        })
      )
      .optional()
      .messages({
        "array.base": "Program Code must be an array of strings",
      }),
    exportFlag: Joi.boolean().optional().messages({
      "boolean.base": "Edit Flag must be a boolean",
    }),
  }),

  // add school details schema
  noc_form_add_school_details_post: Joi.object({
    academicYear: Joi.number().integer().min(1).required().messages({
      "number.base": "Academic year must be a number",
      "number.min": "Academic year must be at least 1",
      "any.required": "Academic year is required",
    }),
    email: Joi.string().email().required().messages({
      "string.base": "Email must be a string",
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
    correspondenceAddress: Joi.string().required().messages({
      "string.base": "Correspondence address must be a string",
      "any.required": "Correspondence address is required",
    }),
    villageCity: Joi.string().required().messages({
      "string.base": "Village/City must be a string",
      "any.required": "Village/City is required",
    }),
    pinCode: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        "string.base": "Pin code must be a string",
        "string.length": "Pin code must be exactly 6 digits long",
        "string.pattern.base": "Pin code must contain only digits",
        "any.required": "Pin code is required",
      }),
    nearestPoliceStation: Joi.string().required().messages({
      "string.base": "Nearest police station must be a string",
      "any.required": "Nearest police station is required",
    }),
    telephoneNumber: Joi.string()
      .pattern(/^[0-9]{3}-[0-9]{8}$/)
      .allow("")
      .optional()
      .messages({
        "string.base": "Telephone number must be a string",
        "string.pattern.base":
          "Telephone number must be in the format 022-12345678",
      }),
    faxNumber: Joi.string()
      .pattern(/^[0-9]{3}-[0-9]{8}$/)
      .allow("")
      .optional()
      .messages({
        "string.base": "Fax number must be a string",
        "string.pattern.base": "Fax number must be in the format 022-87654321",
      }),
    alternateMobileNo: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .allow("")
      .optional()
      .messages({
        "string.base": "Alternate mobile number must be a string",
        "string.length":
          "Alternate mobile number must be exactly 10 digits long",
        "string.pattern.base":
          "Alternate mobile number must contain only digits",
      }),
  }),

  // revert form schema
  edu_dept_revert_form_post: Joi.object({
    schoolId: Joi.number().integer().positive().required().messages({
      "number.base": "School ID must be a number",
      "number.integer": "School ID must be an integer",
      "number.positive": "School ID must be a positive number",
      "any.required": "School ID is required",
    }),
    programCode: Joi.string()
      .valid(
        "schoolDetails",
        "trustDetails",
        "landDetails",
        "schoolInfraDetails",
        "teacherDetails"
      )
      .required()
      .messages({
        "string.base": "Program Code must be a string",
        "any.only":
          "Program Code must be one of 'schoolDetails', 'trustDetails', 'landDetails', 'schoolInfraDetails', 'teacherDetails'",
        "any.required": "Program Code is required",
      }),
    revertReason: Joi.string().min(3).required().messages({
      "string.base": "Revert Reason must be a string",
      "string.min": "Revert Reason must have at least 3 characters",
      "any.required": "Revert Reason is required",
    }),
  }),

  // dm map schema
  edu_dept_map_dm_post: Joi.object({
    schoolId: Joi.number().integer().positive().required().messages({
      "number.base": "School ID must be a number",
      "number.integer": "School ID must be an integer",
      "number.positive": "School ID must be a positive number",
      "any.required": "School ID is required",
    }),
  }),
  report_school_wise_report_post: Joi.object({
    blockId: Joi.number().integer().positive().required().messages({
      "number.base": "Block ID must be a number",
      "number.integer": "Block ID must be an integer",
      "number.positive": "Block ID must be a positive number",
      "any.required": "Block ID is required",
    }),
  }),

  // upload feedback schema
  dm_upload_feedback_post: Joi.object({
    schoolId: Joi.number().integer().positive().required().messages({
      "number.base": "School ID must be a number",
      "number.integer": "School ID must be an integer",
      "number.positive": "School ID must be a positive number",
      "any.required": "School ID is required",
    }),
    feedbackDocumentId: Joi.number().integer().positive().required().messages({
      "number.base": "Feedback document ID must be a number",
      "number.integer": "Feedback document ID must be an integer",
      "number.positive": "Feedback document ID must be a positive number",
      "any.required": "Feedback document ID is required",
    }),
    remarks: Joi.string().optional().messages({
      "string.base": "Remarks must be string",
    }),
  }),
  noc_form_add_rte_recognition_post: Joi.object({
    rteRecognitionStatus: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base": "rteRecognitionStatus must be a number",
        "number.positive": "rteRecognitionStatusmust be a positive number",
        "any.required": "rteRecognitionStatus is required",
      }),
    applicationRecognitionNo: Joi.string().required().messages({
      "string.base": "applicationRecognitionNo must be a string",
      "any.required": "applicationRecognitionNo is required",
    }),
    recognitionDate: Joi.date().iso().required().messages({
      "date.base": "recognitionDate must be a valid date",
      "date.format": "recognitionDate must be in ISO format (YYYY-MM-DD)",
      "any.required": "recognitionDate is required",
    }),
    recognitionValid: Joi.date().iso().required().messages({
      "date.base": "recognitionValid must be a valid date",
      "date.format": "recognitionValid must be in ISO format (YYYY-MM-DD)",
      "any.required": "recognitionValid is required",
    }),
    recognitionDocumentId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base": "recognitionDocumentId must be a number",
        "number.positive": "recognitionDocumentId be a positive number",
        "any.required": "recognitionDocumentId is required",
      }),
    editFlag: Joi.boolean().optional().messages({
      "boolean.base": "Edit Flag must be a boolean",
    }),
  }),
  noc_form_add_affidavit_details_post: Joi.object({
    affidavitTakenBeforeMagistrate: Joi.string()
      .valid("Yes", "No")
      .required()
      .messages({
        "any.only": "affidavitTakenBeforeMagistrate must be Yes or No",
        "string.empty": "affidavitTakenBeforeMagistrate is required",
        "any.required": "affidavitTakenBeforeMagistrate is required",
      }),

    affidavitDocumentId: Joi.number()
      .integer()
      .positive()
      .when("affidavitTakenBeforeMagistrate", {
        is: "Yes",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "number.base": "affidavitDocumentId must be a number",
        "number.positive": "affidavitDocumentId must be a positive number",
        "any.required":
          "affidavitDocumentId is required when affidavitTakenBeforeMagistrate is Yes",
      }),
    editFlag: Joi.boolean().optional().messages({
      "boolean.base": "Edit Flag must be a boolean",
    }),
  }),

  export: Joi.boolean(),
};

/**
 *
 * The validator middleware checks for the request body in each APIs.
 *
 * For each API a key is created which is checked from the @schemas variable.
 * If the key matches all the request body is checked. If the request body is not found 400 error code
 * is thrown. If there are no matching keys the next middleware is called.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express next middleware function
 * @returns
 */

const validator = (req, res, next) => {
  console.log(req.path);
  try {
    const key = `${req.path
      .split("/")
      .splice(2)
      .join("_")
      .split("-")
      .join("_")}_${req.method.toLowerCase()}`;

    const schema = schemas[key];
    console.log({ key: key });
    if (!schema) {
      return next();
    } else {
      const { value, error } = schema.validate(req.body);
      if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);
      else next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = validator;
