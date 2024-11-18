import { ethers } from "ethers";
import { createZGServingNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";

type CarType = "sedan" | "SUV" | "Truck" | "Coupe";

interface CarDescription {
  brand: string;
  model: string;
  car_type: CarType;
}

// 假设这是从 Python 返回的 JSON schema

async function main() {
  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");

  // Step 1: Create a wallet with a private key
  const privateKey =
    "77514FC12C072E4FED22877F156A9E7172DBC73DC8B5CD5481719D112FB5F287";
  const wallet = new ethers.Wallet(privateKey, provider);

  // Step 2: Initialize the broker
  try {
    const broker = await createZGServingNetworkBroker(wallet);

    // Step 3: List available services
    console.log("Listing available services...");
    const services = await broker.listService();
    // services.forEach((service: any) => {
    //   console.log(
    //     `Service: ${service.name}, Provider: ${service.provider}, Type: ${service.serviceType}, Model: ${service.model}, URL: ${service.url}, verifiability: ${service.verifiability}`
    //   );
    // });

    // Step 3.1: Select a service
    const service = services.find(
      (service: any) => service.name === "chat-provider-1"
    );
    if (!service) {
      console.error("Service not found.");
      return;
    }
    const providerAddress = service.provider;

    // // Step 4: Manage Accounts
    // const initialBalance = 0.00000001;
    // // Step 4.1: Create a new account
    // console.log("Creating a new account...");
    // await broker.addAccount(providerAddress, initialBalance);
    // console.log("Account created successfully.");

    // // Step 4.2: Deposit funds into the account
    // const depositAmount = 0.01;
    // console.log("Depositing funds...");
    // await broker.depositFund(providerAddress, depositAmount);
    // console.log("Funds deposited successfully.");

    // Step 4.3: Get the account
    // const account = await broker.getAccount(providerAddress);
    // const accounts = await broker.accountProcessor.listAccount();
    // accounts.forEach((account: any) => {
    //   console.log(`user: ${account.user}, provider: ${account.balance}`);
    // });

    // Step 5: Use the Provider's Services
    console.log("Processing a request...");
    const serviceName = service.name;
    const content =
      "Generate a JSON with the brand, model and car_type of the most iconic car from the 90's";

    await broker.settleFee(providerAddress, serviceName, 0.0000000008);

    // Step 5.1: Get the request metadata
    const { endpoint, model } = await broker.getServiceMetadata(
      providerAddress,
      serviceName
    );

    // Step 5.2: Get the request headers
    const headers = await broker.getRequestHeaders(
      providerAddress,
      serviceName,
      content
    );

    // Step 6: Send a request to the service
    // const response = await fetch(`${endpoint}/chat/completions`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     ...headers,
    //   },
    //   body: JSON.stringify({
    //     messages: [{ role: "system", content }],
    //     model: model,
    //     guided_json: jsonSchema,
    //   }),
    // });

    // const completion = await response.json();

    // console.log("Response:", completion);

    const jsonSchema = {
      type: "object",
      properties: {
        brand: { type: "string" },
        model: { type: "string" },
        car_type: { type: "string", enum: ["sedan", "SUV", "Truck", "Coupe"] },
      },
      required: ["brand", "model", "car_type"],
    };

    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "",
    });
    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "system", content }],
        model: model,
        // @ts-expect-error guided_json is not yet public
        guided_json: jsonSchema,
      },
      {
        headers: {
          ...headers,
        },
      }
    );

    const receivedContent = completion.choices[0].message.content;
    const chatID = completion.id;
    if (!receivedContent) {
      throw new Error("No content received.");
    }
    console.log("Response:", receivedContent);

    // Step 7: Process the response
    // console.log("Processing a response...");
    const isValid = await broker.processResponse(
      providerAddress,
      serviceName,
      receivedContent,
      chatID
    );
    // console.log(`Response validity: ${isValid ? "Valid" : "Invalid"}`);
  } catch (error) {
    console.error("Error during execution:", error);
  }
}

main();
