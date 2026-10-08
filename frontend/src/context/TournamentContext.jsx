import { createContext, useContext } from "react";

export const TournamentContext = createContext();

export const useTournaments = () => useContext(TournamentContext);