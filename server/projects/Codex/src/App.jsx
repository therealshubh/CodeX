import React from 'react';
import './App.css';

function App() {
  return (
    <div className='app-container'>
      <header>
        <h1>College Name</h1>
      </header>
      <main>
        <section className='hero-section'>
          <h2>Welcome to our college!</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet nulla auctor, vestibulum magna sed, convallis ex.</p>
          <button>Learn More</button>
        </section>
        <section className='about-section'>
          <h2>About Us</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet nulla auctor, vestibulum magna sed, convallis ex.</p>
        </section>
      </main>
      <footer>
        <p>&copy; 2024 College Name</p>
      </footer>
    </div>
  );
}

export default App;