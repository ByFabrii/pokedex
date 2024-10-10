// import react-testing methods
import {render, screen} from '@testing-library/react'
// userEvent library simulates user interactions by dispatching the events that would happen if the interaction took place in a browser.
import userEvent from '@testing-library/user-event'
// add custom jest matchers from jest-dom
import '@testing-library/jest-dom'

import { CardPokemon } from '../Components/CardPokemon';
import { Searcher } from '../Components/Searcher';
import { PokemonList } from '../Components';


const mockPokemon = {
  id: 1,
  name: 'bulbasaur',
  sprites: {
    other: {
      dream_world: {
        front_default: 'url-to-bulbasaur-image',
      },
    },
  },
  types: [
    {
      type: {
        name: 'grass',
      },
    },
  ],
};

test('renders the CardPokemon component', () => {
  render(<CardPokemon pokemon={mockPokemon} />);
  const titleElement = screen.getByText(/bulbasaur/i);
  const typeElement = screen.getByText(/grass/i);
  expect(titleElement, typeElement).toBeInTheDocument();
});