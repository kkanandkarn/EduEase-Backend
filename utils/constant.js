module.exports = {
  SERVER_ERROR_MSG:
    "Internal Server Error. Kindly check the request or try again lator.",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  status: {
    ACTIVE: "Active",
    HOLD: "Hold",
    SUSPENDED: "Suspended",
    DELETED: "Deleted",
  },
  PERMISSIONS: {
    TENANT: {
      CREATE: "CREATE-TENANT",
      VIEW: "VIEW-TENANT",
      UPDATE: "UPDATE-TENANT",
      ASSIGN_PERMISSION: "ASSIGN-PERMISSION-TO-TENANT",
    },
    ROLE: {
      CREATE: "CREATE-ROLE",
      VIEW: "VIEW-ROLE",
      UPDATE: "UPDATE-ROLE",
      DELETE: "DELETE-ROLE",
    },
    USER: {
      CREATE: "ADD-USER",
      VIEW: "VIEW-USER",
      UPDATE: "UPDATE-USER",
      DELETE: "DELETE-USER",
    },
  },
};
