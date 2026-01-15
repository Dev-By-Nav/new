import React, { useState } from "react";

const DeckSort = () => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = (e) => {
    setSelectedOption(e.target.value);
    console.log("Selected:", e.target.value);
    // 👆 You can use this value to filter your data
  };

  return (

    <div className="bg-gray-100 mx-10 rounded-lg p-8">


        <h2 className="text-lg font-medium">Filter Decks</h2>



    <div className="flex justify-center mb-6 gap-6 ">

        

      <select
        value={selectedOption}
        onChange={handleChange}
        className="  w-1/4 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">All Subjects</option>
        <option value="biology">Maths</option>
        <option value="maths">Science</option>
        <option value="computer">English</option>
        <option value="english">Computer Science</option>
        <option value="english">Economics</option>
        <option value="english">Geography</option>

      </select>


      <select
        value={selectedOption}
        onChange={handleChange}
        className=" mx-auto w-1/4 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Exam Board</option>
        <option value="biology">AQA</option>
        <option value="maths">OCR</option>
        <option value="computer">Edexcel</option>
        <option value="english">Other</option>
      </select>



      <select
        value={selectedOption}
        onChange={handleChange}
        className=" w-1/4 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Exam</option>
        <option value="biology">GCSE</option>
        <option value="maths">A Level</option>
      </select>
    </div>
    
    
    </div>
  );
};

export default DeckSort;
