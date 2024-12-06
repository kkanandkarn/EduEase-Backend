module.exports = {
  camelize: async (obj) => {
    try {
      const camelcaseKeys = (await import("camelcase-keys")).default;
      return camelcaseKeys(JSON.parse(JSON.stringify(obj)), { deep: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
