import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import axiosInstance from "@/config/axiosInstance";
import useQuestionStore from "@/Zustand/store/question";

interface Answer {
  question: string;
  answer: string;
}

export default function QuestionScreen() {
  const { question: questionData } = useQuestionStore();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [customInput, setCustomInput] = useState("");
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    updateProgress(currentIndex);
  }, [currentIndex]);

  if (!questionData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500 text-lg">Loading questions...</Text>
      </View>
    );
  }

  const { questions = [], collegename = "" } = questionData;

  if (!questions.length) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500 text-lg">No questions found.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasOptions =
    currentQuestion.options && currentQuestion.options.length > 0;

  const handleSelectOption = (option: string) => {
    setCustomInput("");
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        question: currentQuestion.question,
        answer: option,
      };
      return copy;
    });
  };

  const handleInputChange = (text: string) => {
    setCustomInput(text);
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = { question: currentQuestion.question, answer: text };
      return copy;
    });
  };

  const updateProgress = (index: number) => {
    Animated.timing(progressAnim, {
      toValue: (index + 1) / questions.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleNext = () => {
    if (!answers[currentIndex]?.answer) {
      Alert.alert(
        "Select or enter an answer",
        "Please answer before continuing."
      );
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCustomInput(answers[currentIndex + 1]?.answer || "");
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCustomInput(answers[currentIndex - 1]?.answer || "");
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = { collegename, answers };
      const res = await axiosInstance.post("/api/questions/answer", payload);
      if (res.status === 200) {
        Alert.alert(res.data.message);
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit answers.");
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={120}
      className="flex-1 bg-white"
    >
      <View className="p-6">
        {/* College Name */}
        <Text className="text-3xl font-bold text-center text-blue-700 mb-6">
          {collegename}
        </Text>

        {/* Progress Bar */}
        <View className="mb-4">
          <Text className="text-sm text-gray-500 text-right mb-1">
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <Animated.View
              style={{ width: progressWidth }}
              className="h-2 bg-blue-600 rounded-full"
            />
          </View>
        </View>

        {/* Question Card */}
        <View className="bg-white p-5 rounded-2xl shadow-md mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            {currentIndex + 1}. {currentQuestion.question}
          </Text>

          {hasOptions ? (
            currentQuestion.options!.map((opt, idx) => {
              const isSelected = answers[currentIndex]?.answer === opt.text;
              const showCustomInput = opt.text.toLowerCase().includes("other");

              return (
                <View key={idx} className="mb-3">
                  <TouchableOpacity
                    onPress={() => handleSelectOption(opt.text)}
                    className={`px-4 py-3 rounded-full border ${
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "text-white font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      {opt.text}
                    </Text>
                  </TouchableOpacity>

                  {showCustomInput && isSelected && (
                    <TextInput
                      placeholder="Enter your answer"
                      value={customInput}
                      onChangeText={handleInputChange}
                      className="mt-3 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                    />
                  )}
                </View>
              );
            })
          ) : (
            <TextInput
              placeholder="Enter your answer"
              value={customInput}
              onChangeText={handleInputChange}
              className="mt-3 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
            />
          )}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-4">
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              className="flex-1 mr-2 bg-gray-400 py-4 rounded-full"
            >
              <Text className="text-white text-center font-semibold">Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            className={`flex-1 ${currentIndex > 0 ? "ml-2" : ""} bg-blue-600 py-4 rounded-full`}
          >
            <Text className="text-white text-center font-semibold">
              {currentIndex < questions.length - 1 ? "Next" : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
