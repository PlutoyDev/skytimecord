import { Component, onCleanup } from 'solid-js';
import { createSignal, createEffect, createMemo, onMount, For, Show } from 'solid-js';
import { RiSystemMenuFoldLine, RiSystemMenuUnfoldLine, RiSystemSearchLine } from 'solid-icons/ri';
import Fuse from 'fuse.js';

const hardcodedEvents = [
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

const App: Component = () => {
  const [events] = createSignal(hardcodedEvents);
  const fuse = createMemo(() => new Fuse(events(), { keys: ['name', 'alias'], minMatchCharLength: 0 }));

  let searchInput: HTMLInputElement;
  const [isQuerying, setIsQuerying] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const [focusedIndex, setFocusedIndex] = createSignal(0);
  const [selectedEvent, setSelectedEvent] = createSignal<(typeof hardcodedEvents)[0] | null>(null);

  const onSelectEvent = (event: (typeof hardcodedEvents)[0]) => {
    setSelectedEvent(event);
    setQuery(event.name);
    setIsQuerying(false);
    setFocusedIndex(0);
  };

  const results = () => fuse().search(query());

  // Keyboard Shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl + K. Focus on search bar
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class='absolute overflow-hidden inset-0 p-0.5 flex flex-col '>
      <header class='flex justify-between flex-row p-2 bg-purple-500 rounded-md'>
        <div></div>
        <div></div>
      </header>
      <div class='flex-grow h-full container mx-auto mt-2 p-1 flex flex-col overflow-auto'>
        <div class='h-full'>
          <h1 class='w-full text-slate-400 mb-2 text-xl'> Event Name</h1>
          <div class='w-full relative' onBlur={() => setIsQuerying(false)}>
            <input
              ref={searchInput}
              type='text'
              class='block w-full focus:outline-none rounded-lg p-2 mt-0 bg-zinc-800 text-white border border-zinc-700'
              placeholder='Search...'
              value={query()}
              onInput={e => setQuery(e.currentTarget.value)}
              onFocus={() => (selectedEvent() && (setQuery(''), setSelectedEvent(null)), setIsQuerying(true))}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setQuery('');
                } else if (e.key === 'ArrowDown' && focusedIndex() !== results().length - 1) {
                  setFocusedIndex(focusedIndex() + 1);
                } else if (e.key === 'ArrowUp' && focusedIndex() !== 0) {
                  setFocusedIndex(focusedIndex() - 1);
                } else if (e.key === 'Enter') {
                  onSelectEvent(results()[focusedIndex()].item);
                }
              }}
            />

            <Show when={query().length > 0 && isQuerying()}>
              <div class='absolute rounded px-1 pt-1 pb-4 bg-zinc-800 text-white border border-zinc-800 w-full'>
                <For each={results()}>
                  {({ item: event }, index) => (
                    <>
                      <Show when={index() !== 0}>
                        <hr class='border-t-zinc-700' />
                      </Show>
                      <div
                        class='pl-3 py-2 cursor-pointer'
                        classList={{ 'bg-zinc-700': index() === focusedIndex() }}
                        onClick={[onSelectEvent, event]}
                        onMouseEnter={() => setFocusedIndex(index())}
                      >
                        <p class='text-md font-bold'>{event.name}</p>
                      </div>
                    </>
                  )}
                </For>
              </div>
            </Show>
          </div>
          <Show when={selectedEvent()} fallback={<p>No event selected</p>}>
            <p>
              Selected Event: <b>{selectedEvent()?.name}</b>
            </p>
          </Show>
        </div>
      </div>

      <footer class='flex justify-center'>
        <div class='w-1/2'>
          <p class='text-center text-gray-500 text-xs'>Made by Plutoy</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
