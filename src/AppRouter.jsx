import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {Navigation}  from './Components/Navigation'
import { HomePage, PokemonPage } from './Pages/index'

export default function AppRouter() {
  return (
    <Routes>
        <Route path='/' element= { <Navigation />}>
            <Route index element= { <HomePage z/> } />
            <Route path='pokemon/:id' element={<PokemonPage />}/>
        </Route>

        <Route path='*' element={<Navigate to='/' />}/>
    </Routes>
  )
}
