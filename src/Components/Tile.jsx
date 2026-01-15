import React, { useState, useEffect } from "react";

const Tile = ({ title, subject, examBoard, yearGroup, onClickStudy, onClickEdit }) => {
  const [thumbUrl, setThumbUrl] = useState("");

  useEffect(() => {
    fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
        title || "study"
      )}&client_id=vUi51XZJCqSUSn54tItGgVhrRLVnkzUxtXCVb9sMCvM`,
      {
        headers: {
          "Accept-Version": "v1",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.urls?.small_s3) {
          setThumbUrl(data.urls.small_s3);
        }
      })
      .catch((err) => console.error("Unsplash error:", err));
  }, [title]);

  return (
    <div className="bg-gray-100 rounded-xl shadow-sm overflow-hidden w-80">
      <div className="h-48 bg-gray-300">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
            Loading image...
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-4">
        <h2 className="text-black pb-2 text-xl font-medium truncate">
          {title}
        </h2>

        {/* Tag chips (visible to user) */}
        <div className="flex flex-wrap gap-2 pb-3">
          {subject && (
            <span className="text-gray-600 bg-gray-200 rounded-md px-3 py-0.5 text-xs font-medium">
              {subject}
            </span>
          )}
          {examBoard && (
            <span className="text-gray-600 bg-gray-200 rounded-md px-3 py-0.5 text-xs font-medium">
              {examBoard}
            </span>
          )}
          {yearGroup && (
            <span className="text-gray-600 bg-gray-200 rounded-md px-3 py-0.5 text-xs font-medium">
              {yearGroup}
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={onClickStudy}
            className="flex-1 bg-purple-300 text-purple-800 font-medium py-2 rounded-lg hover:bg-purple-400 transition"
          >
            Study Deck
          </button>

          <button
            onClick={onClickEdit}
            className="w-12 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
            title="Edit deck"
          >
            ✏
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tile;
