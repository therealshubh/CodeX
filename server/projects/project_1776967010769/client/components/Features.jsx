import React from 'react';
function Features() {
  return (
    <section className="bg-white p-4 flex flex-col items-center space-y-4">
      <h1 className="text-3xl font-bold">Our Features</h1>
      <div className="flex flex-wrap justify-center space-x-4">
        <div className="bg-blue-500 text-white p-4 flex justify-center items-center w-64 h-64">
          <h2 className="text-2xl font-bold">Feature 1</h2>
        </div>
        <div className="bg-blue-500 text-white p-4 flex justify-center items-center w-64 h-64">
          <h2 className="text-2xl font-bold">Feature 2</h2>
        </div>
        <div className="bg-blue-500 text-white p-4 flex justify-center items-center w-64 h-64">
          <h2 className="text-2xl font-bold">Feature 3</h2>
        </div>
      </div>
    </section>
  );
}
export default Features;