import { Component, createEffect, For, Show } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import Fuse from 'fuse.js';

interface HardcodedEvent {
  type: 'Resets' | 'Repeating' | 'Social Light';
  name: string;
  alias?: string[];
}

interface Event {
  type: 'Resets' | 'Repeating' | 'Social Light' | 'One Time';
  name: string;
  slug: string;
  fullSlug: string;
  alias?: string[];
}

/*
  Reset event only have 1 timing
  Repeating event have start and end time and can happen multiple times a day (With exception of Shard )
  Social Light event have start and end time and can happen multiple times a day
  One Time event have start and end time and can happen only once, retrive from server
*/

const hardcodedEvents: HardcodedEvent[] = [
  {
    type: 'Resets',
    name: 'Daily Reset',
  },
  {
    type: 'Resets',
    name: 'Eden Reset',
  },
  {
    type: 'Repeating',
    name: 'Traveling Spirits',
  },
  {
    type: 'Repeating',
    name: 'Aurora Concert',
  },
  {
    type: 'Repeating',
    name: 'Shattering Shard',
  },
  {
    type: 'Social Light',
    name: 'Sanctuary Geyser',
  },
  {
    type: 'Social Light',
    name: 'Forest Grandma Dinner',
  },
  {
    type: 'Social Light',
    name: 'Sanctuary Turtle',
  },
];

const nToS = (name: string) => name.toLowerCase().replace(' ', '-');

const Search: Component = () => {
  const [query, setQuery] = createSignal('');
  const [events, setEvents] = createSignal<Event[]>(
    hardcodedEvents.map(({ type, name, alias }) => ({
      type,
      name,
      alias,
      slug: `${nToS(name)}`,
      fullSlug: `${nToS(type)}/${nToS(name)}`,
    }))
  );

  const fuse = createMemo(() => new Fuse(events(), { keys: ['name', 'alias'], minMatchCharLength: 0 }));
  const results = () => fuse().search(query())

  createEffect(() => {
    console.log('results', results());
  });


  return (
    <div class='w-full'>
      {/* Search with Suggestion */}
      <div class="rounded px-1 pt-1 pb-4 bg-zinc-800 text-white border border-zinc-800">
      <input
        type='text'
        class='block w-full focus:outline-none rounded p-2 mt-0 mb-2 bg-zinc-800 text-white border border-zinc-700'
        placeholder='Search...'
        value={query()}
        onInput={(e) => setQuery(e.currentTarget.value)}
      />
      <For each={results()} children={({item: {name}}, index) => (
        <>
          <div class='pl-3 py-2'>
            <p class='text-md font-bold'>{name}</p>
          </div>
        </>
      )} />
      </div>
    </div>
  );
};


export default Search;
