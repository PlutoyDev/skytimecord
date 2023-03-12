import type { Component } from 'solid-js';
import { RiSystemMenuFoldLine, RiSystemMenuUnfoldLine, RiSystemSearchLine  } from 'solid-icons/ri'
import {createSignal} from 'solid-js'

const Header: Component = () => {
  return (
    <header class="flex justify-between flex-row p-2 bg-purple-600 rounded-md">
      {/* Menu Button */}
      <div>
        <button type="button" class='w-8 h-8 border-2 rounded-md border-black'>
          <RiSystemMenuUnfoldLine class="m-auto w-6 h-6" />
        </button>
      </div>
      <div>
      <button type="button" class='w-8 h-8 border-2 rounded-md border-black'>
          <RiSystemSearchLine class="m-auto w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;