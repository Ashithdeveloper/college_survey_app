// import resultsave from "../models/resultsave.js";
// import User from "../models/user.model.js";


// const saveResult = async (
//   mental_health,
//   placement_training,
//   skill_training,
//   total_score_college,
//   collegename,
//   userId
// ) => {
//  console.log( "saveResult ",mental_health , placement_training, skill_training, total_score_college, collegename, userId)
//   const userIsStudent = await User.findById(userId);
//   if ( userIsStudent.role !== "student") {
//     throw new Error("User is not a student");
//   }
//   const existingResult = await resultsave.findOne({  student: userId });
//   if(existingResult){
//       return existingResult
//   }
//   try {
//     const result = new resultsave({
//       collegename,
//       results: [
//         {
//           mental_health,
//           placement_training,
//           skill_training,
//           total_score_college,
//         },
//       ],
//       student: userId,
//     });

//     await result.save();
//     return result;
//   } catch (error) {
//     console.error("Error saving result:", error);
//     throw error;
//   }
// };

// export default saveResult;