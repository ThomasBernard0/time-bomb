import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Stack, Button } from "@mui/material";
import { useGameStateSocket } from "../api/games";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import { Card } from "../types";

const Lobby: React.FC = () => {
  const { token } = useAuth();
  const { code } = useParams<{ code: string }>();
  if (!code || !token) return null;
  const { gameState } = useGameStateSocket(code, token);

  const getPlayerCards = () => {
    return gameState?.cards.filter(
      (card) => card.ownerId == gameState.playerId
    );
  };

  const groupCardsByUser = (): Record<string, Card[]> | undefined => {
    return gameState?.cards.reduce((acc, card) => {
      if (card.ownerId === gameState?.playerId) return acc;

      if (!acc[card.ownerId]) {
        acc[card.ownerId] = [];
      }
      acc[card.ownerId].push(card);
      return acc;
    }, {} as Record<string, Card[]>);
  };

  const startGame = () => {
    socket.emit("start-game", { code });
  };

  if (!gameState) return;

  const playerCards = getPlayerCards();
  const otherPlayersCards = groupCardsByUser();

  console.log(playerCards);
  console.log(otherPlayersCards);
  console.log(gameState);

  return (
    <Stack spacing={3} alignItems="center" mt={5}>
      <Typography variant="h4">Lobby de la partie {code}</Typography>

      {gameState.status != "in-progress" ? (
        <Stack spacing={1}>
          {gameState.players.map((player) => (
            <Typography key={player.id}>{player.name}</Typography>
          ))}
          <Button
            variant="contained"
            onClick={startGame}
            disabled={gameState.players.length < 2}
          >
            Commencer la partie
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">La partie a commencé !</Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default Lobby;
