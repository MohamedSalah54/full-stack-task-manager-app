'use client';
import React from 'react';
import {CategoryFilterProps} from "@/interfaces/category"


const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="mb-4 flex justify-center space-x-4">
      {categories.map((category) => (
        <button
          key={category}
          className={`p-2 border rounded-md ${
            selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-white text-black'
          }`}
          onClick={() => onSelectCategory(category)}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
