const axios = require("axios");
const https = require("https");

async function importDomainData() {
  try {
    console.log("Fetching domain data from BJP API...");

    // Fetch data from BJP API
    const response = await axios.get("https://bjp.org/custom/domain-list", {
      timeout: 30000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    let domainData = response.data;

    // Handle different response formats
    if (typeof domainData === "string") {
      domainData = JSON.parse(domainData);
    }

    if (!Array.isArray(domainData)) {
      if (domainData.data && Array.isArray(domainData.data)) {
        domainData = domainData.data;
      } else {
        throw new Error("API response is not in expected array format");
      }
    }

    console.log(`Fetched ${domainData.length} domain records`);

    // Transform the data to match the domain schema
    const transformedDomains = domainData
      .map((domain) => {
        return {
          hostname: domain.hostname || domain.host || domain.domain,
          machine_name:
            domain.machine_name ||
            domain.machineName ||
            domain.name?.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          name: domain.name || domain.title || domain.hostname,
          scheme: domain.scheme || "http",
          status:
            domain.status === "active" || domain.status === 1 || domain.active
              ? "active"
              : "inactive",
          weight: domain.weight || domain.priority || 1,
          is_default:
            domain.is_default || domain.isDefault || domain.default || false,
          test_server_response: domain.test_server_response !== false,
        };
      })
      .filter((domain) => domain.hostname);

    console.log(`Transformed ${transformedDomains.length} domain records`);

    // Import using the working endpoint
    const importResponse = await axios.post(
      "http://localhost:1337/api/import-content-type/import/domain",
      {
        data: transformedDomains,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Import successful:", importResponse.data);
  } catch (error) {
    console.error("Error importing domain data:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the import
importDomainData();
