import React from 'react';

const Background = () => {
  return (
    <>
      {/* Ambient Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      {/* Sunset Sky Header Background */}
      <div className="absolute top-0 left-0 w-full h-[300px] sm:h-[400px] bg-gradient-to-b from-orange-200 via-rose-200 to-transparent z-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 animate-clouds"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23a0aec0\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>
    </>
  );
};

export default Background;
