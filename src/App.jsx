import AppRouter from './AppRouter'
import { PokemonProvider } from './Context/PokemonProvider'
import { FavoritesProvider } from './Context/FavoritesProvider'

function App() {
  return (
    <FavoritesProvider>
      <PokemonProvider>
        <AppRouter/>
      </PokemonProvider>
    </FavoritesProvider>
  )
}

export default App
