const API_BASE_URL = process.env.NEXT_PUBLIC_NEBULA_API_BASE_URL;
const SECRET_KEY = process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY;

// Utility function to make API requests
async function apiRequest(endpoint, method, body = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-secret-key": SECRET_KEY,
    },
    body: Object.keys(body).length ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Response Error:", errorText);
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Modify createSession to include tokenAddress and chainId
async function createSession(title, tokenAddress, chainId) {
  const response = await apiRequest("/session", "POST", { 
    title,
    context_filter: {
      chain_ids: [chainId.toString()],
      contract_addresses: [tokenAddress],
    }
  });
  return response.result.id;
}

// Add a function to get session history
async function getSessionHistory(sessionId) {
  const response = await apiRequest(`/session/${sessionId}`, "GET");
  return response.result.history;
}

// Query the smart contract
async function queryContract(contractAddress, chainId, sessionId) {
  // Dynamically create the message for the query
  const message = `
    Give me the deatils of this contract and provide a structured list of all functions available in the smart contract deployed at address ${contractAddress} on chain ${chainId}. The response must strictly follow this format:

    ### Contract Details:
    - **Address:** <contractAddress>
    - **Chain ID:** <chainId>
    - **Blockchain:** <blockchainName>

    ### Read-only Functions:
    1. **\`<functionName(parameters)\`**
       - **Returns:** <returnType> (e.g., uint256, string, bool, etc.)
       - **Description:** <brief description of what the function does>

    ### Write-able Functions:
    1. **\`<functionName(parameters)\`**
       - **Returns:** <returnType> (if applicable)
       - **Description:** <brief description of what the function does>
       - **Payable:** <true/false> (if the function can accept Ether).
       - **Parameters:** <parameterName> <parameterType> <parameterDescription>

    If no functions exist in a category, include the section with "None available." Ensure the response is accurate, concise, and excludes unrelated details. If the contract implements interfaces (e.g., ERC20, ERC721), include their functions as well.
  `.trim();

  const requestBody = {
    message,
    session_id: sessionId,
    context_filter: {
      chain_ids: [chainId.toString()],
      contract_addresses: [contractAddress],
    },
  };

  console.log("Query Contract Request Body:", requestBody);

  // Make the API request
  const response = await apiRequest("/chat", "POST", requestBody);

  return response.message; // Return the structured response from Nebula
}

// Modify handleUserMessage to always use the session
async function handleUserMessage(userMessage, sessionId, chainId, contractAddress) {
  const response = await apiRequest("/chat", "POST", {
    message: userMessage,
    session_id: sessionId,
    context_filter: {
      chain_ids: [chainId.toString()],
      contract_addresses: [contractAddress],
    },
  });
  return response.message;
}

async function updateSession(sessionId, title, isPublic) {
  const requestBody = {
    title,
    is_public: isPublic,
  };

  const response = await apiRequest(
    `/session/${sessionId}`,
    "PUT",
    requestBody
  );

  console.log(`Session ${sessionId} updated:`, response);
  return response; // Returns the updated session details
}

async function clearSession(sessionId) {
  const response = await apiRequest(`/session/${sessionId}/clear`, "POST");

  console.log(`Session ${sessionId} cleared.`);
  return response; // Returns a confirmation or updated session status
}

async function deleteSession(sessionId) {
  const response = await apiRequest(`/session/${sessionId}`, "DELETE");

  console.log(`Session ${sessionId} deleted.`);
  return response; // Returns a confirmation
}

// Function to execute transaction

async function executeCommand(
  message,
  signerWalletAddress,
  userId = "default-user",
  stream = false,
  chainId,
  contractAddress,
  sessionId
) {
  const requestBody = {
    message,
    user_id: userId,
    stream,
    session_id: sessionId,
    execute_config: {
      mode: "client", // Only client mode is supported
      signer_wallet_address: signerWalletAddress,
    },
    context_filter: {
      chain_ids: [chainId.toString()], // Chain ID must be a string
      contract_addresses: [contractAddress],
    },
  };

  console.log("Execute Command Request Body:", requestBody);

  const response = await apiRequest("/execute", "POST", requestBody);

  console.log("Execute Command Response:", response);

  return response; // Return the full response including message and actions
}

export {
  createSession,
  queryContract,
  handleUserMessage,
  updateSession,
  clearSession,
  deleteSession,
  executeCommand,
  getSessionHistory, // Add this new function to the exports
};