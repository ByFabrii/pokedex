import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {Navigation}  from './Components/Navigation'
import { HomePage, PokemonPage, FavoritosPage } from './Pages/index'
// import { ComparadorPage } from './Pages/index' // Comparador desactivado por ahora

export default function AppRouter() {
  return (
    <Routes>
        <Route path='/' element= { <Navigation />}>
            <Route index element= { <HomePage z/> } />
            <Route path='pokemon/:id' element={<PokemonPage />}/>
            {/* <Route path='comparar' element={<ComparadorPage />}/> */}
            <Route path='favoritos' element={<FavoritosPage />}/>
        </Route>

        <Route path='*' element={<Navigate to='/' />}/>
    </Routes>
  )
}
