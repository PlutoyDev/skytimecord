import type { Component } from 'solid-js';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

const App: Component = () => {
  return (
    <div class='absolute overflow-hidden inset-0 p-0.5 flex flex-col '>
      <Header />
      <div class="flex-grow h-full container mx-auto p-1 flex flex-col mt-[10%] overflow-auto">
        <Home />
      </div>
      <Footer />
    </div>
  );


};

export default App;
