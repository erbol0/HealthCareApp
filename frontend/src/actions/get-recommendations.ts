"use server";

import ai from "@/lib/google";
import { Symptom, Medication, User } from "@prisma/client";

interface Props {
  symptoms: Symptom[];
  medications: Medication[];
  user: User;
}

const generateRecommendations = ({ symptoms, medications, user }: Props) => {
  const { age, bloodGroup, firstName, gender, height, medicalIssues, weight } =
    user;

  const formattedSymptoms = symptoms
    .map((symptom) => {
      return `- ${symptom.name} (Intensity: ${symptom.intensity}, Frequency: ${symptom.frequency})`;
    })
    .join("\n");

  const formattedMedications = medications
    .map((medication) => {
      return `- ${medication.name} (Dosage: ${medication.dosage}, Frequency: ${medication.frequency})`;
    })
    .join("\n");

  const prompt = `
        The user ${firstName ? firstName : ""} is ${
    age ? `${age} years old` : "of unknown age"
  }, ${gender ? gender : "of unknown gender"}. 
        Their blood group is ${
          bloodGroup ? bloodGroup : "unknown"
        }, height is ${height ? `${height} cm` : "unknown"}, and weight is ${
    weight ? `${weight} kg` : "unknown"
  }. 
        They have the following medical issues: ${
          medicalIssues ? medicalIssues : "none reported"
        }.

        Here are the details of their health condition:

        Symptoms:
        ${formattedSymptoms}

        Medications:
        ${formattedMedications}

        Based on the above information, provide a concise summary of personalized health recommendations that can be displayed on the main dashboard page. These recommendations should be clear, practical, and focused on improving the user's overall well-being. Please provide up to 10 of the most important and relevant tips. Do not include any medical advice, disclaimers, warnings, or any other information that could be considered as medical advice. Just provide general health recommendations based on the information provided.
    `;

  return prompt;
};

const getRecommendations = async ({ symptoms, medications, user }: Props) => {
  const prompt = generateRecommendations({ symptoms, medications, user });

  const model = ai.getGenerativeModel({
    model: "gemini-1.5-pro-latest",
    systemInstruction:
      "You are a health recommendation system. Your task is to provide personalized health recommendations based on the user's information, symptoms, and medications.\nBased on the user information, generate up to 5 concise, personalized health recommendations. Follow these guidelines:\n\n1. Analyze the user's information, symptoms, and medications.\n2. Provide relevant and important health recommendations.\n3. If asked, suggest necessary medicines and precautions.\n4. Do not include disclaimers or warnings.\n5. Do not advise the user to consult a doctor or seek medical help.\n6. Only provide general health recommendations based on the given information.\n7. Ignore questions unrelated to the provided health conditions, symptoms, and medications.\n8. Do not answer queries about coding, sports, or other unrelated topics.\nRemember to keep your recommendations concise and directly related to the user's health information provided.\n\n",
  });

  if (!prompt) {
    throw new Error("Failed to generate recommendations prompt");
  }

  try {
    const result = await model.generateContent(prompt);
    const res = await result.response;
    const recommendations = res.text();

    if (!recommendations) {
      throw new Error("No recommendations were generated");
    }

    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
    throw new Error("Failed to generate recommendations");
  }
};

export default getRecommendations;
