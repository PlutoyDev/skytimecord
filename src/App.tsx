import {
  Component,
  createContext,
  Match,
  onCleanup,
  ParentProps,
  Switch,
  useContext,
  createSignal,
  createEffect,
  createMemo,
  onMount,
  For,
  Show,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { RiSystemArrowDropDownLine } from 'solid-icons/ri';
import { DateTime, Duration } from 'luxon';
import Fuse from 'fuse.js';
import { hourlyEventParameters } from './data/HourlyEventParam';

const APP_TIMEZONE = 'America/Los_Angeles';

interface Settings {
  timestampFormat: string;
  nextFrom?: string | number | DateTime;
}

const NowContext = createContext<DateTime>(DateTime.local({ zone: APP_TIMEZONE }));
const SettingsContext = createContext<Settings>();

const useNow = () => useContext(NowContext);
const useSettings = () => useContext(SettingsContext);

interface HardcodedEvent {
  type: string;
  name: string;
  alias?: string[];
}

const hardcodedEvents: HardcodedEvent[] = [
  {
    type: 'One Time',
    name: 'Daily Reset',
  },
  {
    type: 'One Time',
    name: 'Eden Reset',
  },
  {
    type: 'Hourly',
    name: 'Sanctuary Geyser',
  },
  {
    type: 'Hourly',
    name: 'Forest Grandma Dinner',
  },
  {
    type: 'Hourly',
    name: 'Sanctuary Turtle',
  },
  {
    type: 'Hourly',
    name: 'Aurora Concert',
  },
  {
    type: 'Traveling Spirits',
    name: 'Traveling Spirits',
  },
  {
    type: 'Shattering Shard',
    name: 'Shattering Shard',
  },
];

const timestampFormatOption: DropdownOption[] = [
  { label: 'Short Time', value: '%t' },
  { label: 'Long Time', value: '%T' },
  { label: 'Short Date', value: '%d' },
  { label: 'Long Date', value: '%D' },
  { label: 'Short Date/Time', value: '%f' },
  { label: 'Long Date/Time', value: '%F' },
  { label: 'Relative Time', value: '%R' },
  { label: 'Short Time (Relative)', value: '%t (%R)' },
  { label: 'Long Time (Relative)', value: '%T (%R)' },
  { label: 'Short Date (Relative)', value: '%d (%R)' },
  { label: 'Long Date (Relative)', value: '%D (%R)' },
  { label: 'Short Date/Time (Relative)', value: '%f (%R)' },
  { label: 'Long Date/Time (Relative)', value: '%F (%R)' },
];

const App: Component = () => {
  const [settings, setSettings] = createStore({ timestampFormat: '%R' } as Settings);

  // Query States
  let searchInput: HTMLInputElement;
  const [selectedEvent, setSelectedEvent] = createSignal<HardcodedEvent | null>(null);

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
      <header class='flex justify-center flex-row p-3 bg-purple-500 rounded-md'>
        <h1 class='text-2xl font-extrabold'>Sky Timestamp for Discord</h1>
      </header>
      <div class='flex-grow h-full container mx-auto mt-2 p-1 flex flex-col overflow-auto text-slate-400'>
        <NowProvider>
          <form class='grid gap-3 auto-rows-max grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4'>
            <div>
              <h1 class='w-full text-slate-400 mb-2 text-xl'>Timestamp format</h1>
              <Dropdown
                options={timestampFormatOption}
                onSelect={v => setSettings({ ...settings, timestampFormat: v })}
                selected={settings.timestampFormat}
              />
            </div>
            <div>
              <h1 class='w-full text-slate-400 mb-2 text-xl'> Event Name</h1>
              <EventSearch ref={searchInput} onSelectEvent={setSelectedEvent} />
            </div>
            <SettingsContext.Provider value={settings}>
              <Show when={selectedEvent()} fallback={<GridDivider text='No event selected' />}>
                <Switch fallback={<GridDivider text='Error: Unknown event' />}>
                  <Match when={selectedEvent()?.type === 'One Time'}>
                    <OneTimeEvent name={selectedEvent()?.name} />
                  </Match>
                  <Match when={selectedEvent()?.type === 'Hourly'}>
                    <HourlyEvent name={selectedEvent()?.name} />
                  </Match>
                  <Match when={selectedEvent()?.type === 'Traveling Spirits'}>
                    <TravelingSpiritEvent />
                  </Match>
                  <Match when={selectedEvent()?.type === 'Shattering Shard'}>
                    <ShatteringShardEvent />
                  </Match>
                </Switch>
              </Show>
            </SettingsContext.Provider>
          </form>
        </NowProvider>
      </div>

      <footer class='flex justify-center'>
        <div class='w-1/2'>
          <p class='text-center text-gray-500 text-xs'>Made by Plutoy</p>
        </div>
      </footer>
    </div>
  );
};

function NowProvider(props: ParentProps) {
  const [now, setNow] = createSignal(DateTime.local({ zone: APP_TIMEZONE }));
  setInterval(() => setNow(DateTime.local({ zone: APP_TIMEZONE })), 1000);
  return <NowContext.Provider value={now()}>{props.children}</NowContext.Provider>;
}

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selected?: string;
  onSelect: (value: string) => void;
}

function Dropdown(props: DropdownProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [selected, setSelected] = createSignal(props.selected);

  const toggleOpen = () => setIsOpen(!isOpen());

  const onSelect = (value: string) => {
    setSelected(value);
    props.onSelect(value);
    setIsOpen(false);
  };

  return (
    <div class='relative'>
      <div class='relative'>
        <button
          type='button'
          class='relative w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm'
          aria-haspopup='listbox'
          aria-expanded='true'
          aria-labelledby='listbox-label'
          onClick={toggleOpen}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        >
          <span class='flex items-center'>
            <span class='ml-3 block truncate'>
              {props.options.find(({ value }) => value === selected())?.label ?? selected()}
            </span>
          </span>
          <span class='ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
            <RiSystemArrowDropDownLine class='h-5 w-5 text-gray-400' aria-hidden='true' />
          </span>
        </button>
      </div>

      <Show when={isOpen()}>
        <div class='absolute mt-1 w-full rounded-md bg-zinc-800 shadow-lg z-10'>
          <ul
            tabindex='-1'
            role='listbox'
            aria-labelledby='listbox-label'
            aria-activedescendant='listbox-item-3'
            class='max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm'
          >
            <For each={props.options}>
              {({ label, value, description }) => (
                <li
                  id='listbox-item-0'
                  role='option'
                  class='text-slate-400 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-zinc-700 hover:text-slate-300'
                  classList={{ 'bg-zinc-700': value === selected() }}
                  onClick={[onSelect, value]}
                >
                  <div class='flex items-center'>
                    <span class='font-normal ml-3 block truncate'>
                      {label}
                      <Show when={description}>
                        <span class='text-gray-500'> - {description}</span>
                      </Show>
                    </span>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}

interface EventSearchProps {
  onSelectEvent: (event: HardcodedEvent) => void;
  ref?: HTMLInputElement;
}

function EventSearch(props: EventSearchProps) {
  const [events] = createSignal(hardcodedEvents);
  const fuse = createMemo(() => new Fuse(events(), { keys: ['name', 'alias'], minMatchCharLength: 0 }));

  const [isQuerying, setIsQuerying] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const [focusedIndex, setFocusedIndex] = createSignal(0);
  const [selectedEvent, setSelectedEvent] = createSignal<HardcodedEvent | null>(null);

  const onSelectEvent = (event: HardcodedEvent) => {
    setSelectedEvent(event);
    setQuery(event.name);
    setIsQuerying(false);
    setFocusedIndex(0);
    props.onSelectEvent(event);
  };

  const results = () =>
    query().length > 0
      ? fuse()
          .search(query())
          .map(({ item }) => item)
      : events();

  return (
    <div class='w-full relative'>
      <input
        ref={props.ref}
        type='text'
        class='block w-full focus:outline-none rounded-lg p-2 mt-0 bg-zinc-800 text-white border border-zinc-700'
        placeholder='Search...'
        value={query()}
        onInput={e => setQuery(e.currentTarget.value)}
        onFocus={() => (selectedEvent() && (setQuery(''), setSelectedEvent(null)), setIsQuerying(true))}
        onBlur={() => setTimeout(() => setIsQuerying(false), 200)}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            setQuery('');
          } else if (e.key === 'ArrowDown' && focusedIndex() !== results().length - 1) {
            e.preventDefault();
            setFocusedIndex(focusedIndex() + 1);
          } else if (e.key === 'ArrowUp' && focusedIndex() !== 0) {
            e.preventDefault();
            setFocusedIndex(focusedIndex() - 1);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            onSelectEvent(results()[focusedIndex()]);
          }
        }}
      />

      <Show when={isQuerying()}>
        <div class='absolute rounded px-1 pt-1 pb-4 bg-zinc-800 text-white border border-zinc-800 w-full max-h-56 overflow-y-scroll'>
          <For each={results()}>
            {(event, index) => (
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
  );
}

function GridDivider(props: { text?: string; divClass?: string; lineClass?: string; textClass?: string }) {
  return (
    <div class={`col-span-full ${props.divClass ?? 'my-1'}`}>
      <hr class={`border-t-zinc-700 ${props.lineClass}`} />
      <p class={`text-center text-gray-500 whitespace-pre-line ${props.textClass}`}>{props.text}</p>
    </div>
  );
}

const hint =
  'Hover over the following box to reveal the timestamp code\nClick on it to copy the timestamp to your clipboard.';
interface EventAsProp {
  name: string;
}

function OneTimeEvent(props: EventAsProp) {
  const previous = () => (props.name === 'Eden Reset' ? useNow().startOf('week') : useNow().startOf('day'));
  const next = () =>
    (props.name === 'Eden Reset' ? useNow().endOf('week') : useNow().endOf('day')).plus({ seconds: 1 });

  return (
    <>
      <GridDivider text={hint} />
      <ItemTimestamp time={previous()} label={`Previous ${props.name}`} />
      <ItemTimestamp time={next()} label={`Next ${props.name}`} />
    </>
  );
}

function HourlyEvent(props: EventAsProp) {
  const eventParemter = () => hourlyEventParameters[props.name];
  const nextStart = () => {
    const now = useNow();
    const { period, offset } = eventParemter();
    const seconds = 60 - now.second;
    const minuteOffset = (offset?.rescale().minutes ?? 0) - now.minute - (seconds > 0 ? 1 : 0);
    const hourOffset = now.hour % period.rescale().hours;

    return now.plus({
      hours: hourOffset === 0 && minuteOffset > 0 ? 0 : period.rescale().hours - hourOffset,
      minutes: minuteOffset,
      seconds,
    });
  };
  const nextEnd = () => nextStart().plus(eventParemter().fullDuration);
  const nextActiveStart = () =>
    eventParemter().preActiveDuration && nextStart().plus(eventParemter().preActiveDuration);
  const nextActiveEnd = () => eventParemter().postActiveDuration && nextEnd().minus(eventParemter().postActiveDuration);

  const prevStart = () => nextStart().minus(eventParemter().period);
  const prevEnd = () => nextEnd().minus(eventParemter().period);

  const todayStarts = () => {
    const now = useNow();
    const { period, offset } = eventParemter();
    const qty = now.hour / period.rescale().hours;
    const first = now.startOf('day').plus({ hours: offset?.rescale().hours ?? 0 });
    return Array.from({ length: qty }, (_, i) => first.plus({ hours: i * period.rescale().hours }));
  };

  const todayEnds = () => todayStarts().map(start => start.plus(eventParemter().fullDuration));
  const todayActiveStarts = () =>
    eventParemter().preActiveDuration && todayStarts().map(start => start.plus(eventParemter().preActiveDuration));
  const todayActiveEnds = () =>
    eventParemter().postActiveDuration && todayEnds().map(end => end.minus(eventParemter().postActiveDuration));

  // const [anyDate, setAnyDate] = createSignal();

  // const anyDateStarts = () => todayStarts().map(start => start.plus({ days: 1 }));
  // const anyDateEnds = () => todayEnds().map(end => end.plus({ days: 1 }));
  // const anyDateActiveStarts = () => todayActiveStarts()?.map(start => start.plus({ days: 1 }));
  // const anyDateActiveEnds = () => todayActiveEnds()?.map(end => end.plus({ days: 1 }));

  return (
    <>
      <GridDivider text={hint} />
      <ItemTimestamp
        time={nextStart()}
        label={`Next ${props.name} start`}
        description={eventParemter().startedDescription}
      />
      <Show when={eventParemter().preActiveDuration}>
        <ItemTimestamp
          time={nextActiveStart()}
          label={`Next ${props.name} active starts`}
          description={eventParemter().activeDescription}
        />
      </Show>
      <Show when={eventParemter().postActiveDuration}>
        <ItemTimestamp time={nextActiveEnd()} label={`Next ${props.name} active ends`} />
      </Show>
      <ItemTimestamp time={nextEnd()} label={`Next ${props.name} ends`} />
      <GridDivider />
      <ItemTimestamp time={prevStart()} label={`Previous ${props.name} start`} />
      <ItemTimestamp time={prevEnd()} label={`Previous ${props.name} ends`} />
    </>
  );
}

const tsPivot = {
  date: DateTime.local(2022, 1, 10, { zone: APP_TIMEZONE }),
  count: 52,
};

function TravelingSpiritEvent() {
  const now = useNow();
  const nextTsEnd = () => {
    const nextMon = now.plus({ weeks: 1 }).startOf('week');
    return Math.floor(nextMon.diff(now, 'weeks').weeks) % 2 ? nextMon.plus({ weeks: 1 }) : nextMon;
  };
  const nextTsStart = () => nextTsEnd().minus({ days: 4 });
  const nextTsCount = () => Math.ceil(nextTsStart().diff(tsPivot.date, 'weeks').weeks / 2) + tsPivot.count;

  const prevTsEnd = () => nextTsEnd().minus({ weeks: 2 });
  const prevTsStart = () => nextTsStart().minus({ weeks: 2 });
  const prevTsCount = () => nextTsCount() - 1;

  return (
    <>
      <GridDivider text={hint} />
      <ItemTimestamp
        time={nextTsStart()}
        label='Next Traveling Spirit start'
        description={`Traveling Spirit ${nextTsCount()}`}
      />
      <ItemTimestamp time={nextTsEnd()} label='Next Traveling Spirit ends' />
      <GridDivider />
      <ItemTimestamp
        time={prevTsStart()}
        label='Previous Traveling Spirit start'
        description={`Traveling Spirit ${prevTsCount()}`}
      />
      <ItemTimestamp time={prevTsEnd()} label='Previous Traveling Spirit ends' />
    </>
  );
}

function ShatteringShardEvent() {
  return (
    <>
      <GridDivider text={hint} />
      <div class='col-span-full'>
        <p class='block text-center text-5xl text-red-600'>Not implemented</p>
      </div>
    </>
  );
}

interface ItemDropdownProps {
  label: string;
  description?: string;
  options: DropdownOption[];
  onSelect?: (option: DropdownOption | undefined) => void;
}

function ItemDropdown(props: ItemDropdownProps) {
  return (
    <div class='rounded-lg px-4 py-2 '>
      <p class='text-sm font-bold'>{props.label}</p>
      <Show when={props.description}>
        <p class='text-xs text-gray-500'>{props.description}</p>
      </Show>
      <div class='mt-1 ml-2 w-full'>
        <Dropdown
          options={props.options}
          onSelect={v => props.onSelect(props.options.find(({ value }) => v === value))}
        />
      </div>
    </div>
  );
}

interface ItemTimestampProps {
  time: DateTime;
  label: string;
  description?: string;
}

function ItemTimestamp(props: ItemTimestampProps) {
  return (
    <div class='border border-zinc-600 rounded-lg px-4 py-2 '>
      <p class='text-sm font-bold'>{props.label}</p>
      <Show when={props.description} fallback={<div class='min-h-[1rem] text-xs text-gray-500' />}>
        <p class='text-xs text-gray-500'>{props.description}</p>
      </Show>
      <div class='mt-1 ml-2 w-full'>
        <CopyableTimestampBox time={props.time} />
      </div>
    </div>
  );
}

function CopyableTimestampBox(props: { time: DateTime }) {
  const settings = useSettings();
  const [showRaw, setShowRaw] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  const formattedTime = () => timestampFormater(props.time, settings.timestampFormat);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedTime().code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div
      class='w-full p-2 rounded-lg bg-zinc-900 cursor-pointer'
      onMouseEnter={() => setShowRaw(true)}
      onMouseLeave={() => (setCopied(false), setShowRaw(false))}
      onClick={copyToClipboard}
    >
      <span class='text-2xl font-bold text-white whitespace-pre-wrap'>
        {copied() ? 'Copied!' : showRaw() ? formattedTime().code : formattedTime().str}
      </span>
    </div>
  );
}

/*
t	16:20	Short Time
T	16:20:30	Long Time
d	20/04/2021	Short Date
D	20 April 2021	Long Date
f *	20 April 2021 16:20	Short Date/Time
F	Tuesday, 20 April 2021 16:20	Long Date/Time
R	2 months ago	Relative Time

*/

const discordTimeTokenToLuxonToken = {
  t: 'HH:mm',
  T: 'HH:mm:ss',
  d: 'dd/MM/yyyy',
  D: 'dd MMMM yyyy',
  f: 'dd MMMM yyyy HH:mm',
  F: 'cccc, dd MMMM yyyy HH:mm',
};

function timestampFormater(time: DateTime, format: string) {
  const code = format.replaceAll(/%([tTdDfFR])/g, (_, p1) => `<t:${time.toUnixInteger()}:${p1}>`);
  const str = format.replaceAll(/%([tTdDfFR])/g, (_, p1) =>
    p1 !== 'R' ? time.toFormat(discordTimeTokenToLuxonToken[p1]) : time.toRelative(),
  );
  return { code, str };
}

export default App;
