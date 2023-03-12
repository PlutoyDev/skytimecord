import Search from '../components/Search';
import { createSignal, createEffect, onCleanup, Component } from 'solid-js';

const Home: Component = () => {
  const [query, setQuery] = createSignal('');

  createEffect(() => {
    console.log('query', query());
  });

  onCleanup(() => {
    console.log('cleanup');
  });

  return (
    <div class='h-full'>
      <h1 class="w-full text-slate-400 mb-2 text-xl"> Search for events</h1>
      <Search />
    </div>
  );
};

export default Home;