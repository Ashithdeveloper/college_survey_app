import { View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import axiosInstance from "@/config/axiosInstance";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function QuestionScreen() {
  const select = useSelector((state: any) => state.ques.question);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{
    [key: number]: { question: string; answer: string };
  }>({});
  const [customInputs, setCustomInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const router = useRouter();

  if (!select?.questions?.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-lg">No questions found.</Text>
      </View>
    );
  }

  const currentQuestion = select.questions[currentIndex];

  // Handle selecting an option
  const handleSelect = (option: string) => {
    if (option === "Other (please specify)" || option === "Option 1") {
      // Wait for custom input, don't close it
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: {
          question: currentQuestion.question,
          answer: customInputs[currentIndex] || "",
        },
      }));
    } else {
      // Normal option
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: { question: currentQuestion.question, answer: option },
      }));
      setCustomInputs((prev) => ({ ...prev, [currentIndex]: "" }));
    }
  };

  // Handle typing in the input box
  const handleInputChange = (text: string) => {
    setCustomInputs((prev) => ({ ...prev, [currentIndex]: text }));
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: { question: currentQuestion.question, answer: text },
    }));
  };

  // Go to next question or submit
  const handleNext = () => {
    if (!answers[currentIndex]?.answer) {
      Alert.alert(
        "Select or enter an answer",
        "Please answer before continuing."
      );
      return;
    }

    if (currentIndex < select.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  // Go back
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Final submit
const handleSubmit = async () => {
  try {
    // Format answers object (if using state like {0: {question, answer}, ...})
    const formattedAnswers = Object.keys(answers).map((key) => {
      const index = Number(key);
      return {
        id: index + 1, // or actual question ID
        question: answers[index].question,
        answer: answers[index].answer || "",
      };
    });

    const payload = {
      collegename: select.collegename,
      answers: formattedAnswers,
    };

    console.log("Payload to send:", payload);

    // Send POST request to backend
    const res = await axiosInstance.post("/api/questions/answer", payload);

    console.log("Response from backend:", res.data);
    if( res.status === 200) {
        Alert.alert(res.data.message);
        router.replace("/(tabs)");
    }
  
  } catch (err) {
    console.error("Error submitting answers:", err);
    Alert.alert("Error", "Failed to submit answers.");
  }
};


  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={90}
      className="flex-1 bg-gray-50"
    >
      <View className=" p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginBottom: 12,
            padding: 8,
            borderRadius: 8,
            backgroundColor: "#007AFF",
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>← Back</Text>
        </TouchableOpacity>
        {/* College name */}
        <Text className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {select.collegename}
        </Text>

        {/* Question card */}
        <View className="p-4 bg-white rounded-xl shadow-md mb-6">
          <Text className="text-lg font-semibold mb-4 text-gray-900">
            {currentIndex + 1}. {currentQuestion.question}
          </Text>

          {currentQuestion.options.map((option: string, idx: number) => {
            const isSelected =
              answers[currentIndex]?.answer === option ||
              ((option === "Other (please specify)" || option === "Option 1") &&
                customInputs[currentIndex] !== undefined);

            return (
              <View key={idx} className="mb-3">
                <TouchableOpacity
                  onPress={() => handleSelect(option)}
                  className={`p-3 rounded-lg border ${
                    isSelected
                      ? "bg-blue-500 border-blue-600"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      isSelected ? "text-white font-bold" : "text-gray-800"
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>

                {/* Show input if selected option needs extra text */}
                {(option === "Other (please specify)" ||
                  option === "Option 1") &&
                  answers[currentIndex] &&
                  answers[currentIndex].question ===
                    currentQuestion.question && (
                    <TextInput
                      placeholder="Enter your answer"
                      value={customInputs[currentIndex] || ""}
                      onChangeText={handleInputChange}
                      className="mt-2 p-3 border border-gray-300 rounded-lg bg-white"
                    />
                  )}
              </View>
            );
          })}
        </View>

        {/* Navigation buttons */}
        <View className="flex-row justify-between">
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              className="bg-gray-400 py-4 px-6 rounded-xl shadow-lg"
            >
              <Text className="text-center text-white text-lg font-bold">
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            className="bg-blue-600 py-4 px-6 rounded-xl shadow-lg ml-auto"
          >
            <Text className="text-center text-white text-lg font-bold">
              {currentIndex < select.questions.length - 1 ? "Next" : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
