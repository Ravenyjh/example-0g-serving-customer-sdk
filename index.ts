import { ethers } from "ethers";
import { createZGServingNetworkBroker } from "@0glabs/0g-serving-broker";
// import pkg from "@0glabs/0g-serving-broker";
// const { createZGServingNetworkBroker } = pkg;

async function main() {
  const provider = new ethers.JsonRpcProvider(
    "https://0g-json-rpc-public.originstake.com"
  );

  // Step 2: Create a wallet with a private key
  // Replace 'YOUR_PRIVATE_KEY_HERE' with the actual private key but do not hard-code it in production.
  const privateKey =
    "2F63294033D7629EED58DF4E9F7B71E7448338BD48E1002F84D543EBD0C54349";
  const wallet = new ethers.Wallet(privateKey, provider);

  // Step 2: Initialize the broker
  try {
    const broker = await createZGServingNetworkBroker(wallet);

    // Step 3: List available services
    console.log("Listing available services...");
    const services = await broker.listService();
    services.forEach((service) => {
      console.log(
        `Service: ${service.name}, Provider: ${service.provider}, Type: ${service.serviceType}`
      );
    });

    // Step 4: Manage Accounts
    // Let's assume we are using a dummy provider address for demonstration
    const providerAddress = "0xProviderAddress";
    const initialBalance = "10000"; // Using a big int value for the balance

    console.log("Creating a new account...");
    await broker.addAccount(providerAddress, initialBalance);
    console.log("Account created successfully.");

    // Deposit funds into the account
    const depositAmount = "5000";
    console.log("Depositing funds...");
    await broker.depositFund(providerAddress, depositAmount);
    console.log("Funds deposited successfully.");

    // Step 5: Use the Provider's Services
    const serviceName = services[0].name;
    const content = "Sample request content";

    // Process a request and obtain headers
    console.log("Processing a request...");
    const headers = broker.requestProcessor.processRequest(
      providerAddress,
      serviceName,
      content
    );
    console.log("Generated headers:", headers);

    // Simulating a response process
    const receivedContent = "Sample response content";
    const chatID = "dummyChatID"; // For demonstration purposes

    console.log("Processing a response...");
    const isValid = await broker.processResponse(
      providerAddress,
      serviceName,
      receivedContent,
      chatID
    );
    console.log(`Response validity: ${isValid ? "Valid" : "Invalid"}`);
  } catch (error) {
    console.error("Error during execution:", error);
  }
}

main();
