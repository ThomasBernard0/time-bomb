import { Box, Typography } from "@mui/material";

const WireCounter: React.FC<{ count: number }> = ({ count }) => {
  return (
    <Box
      position="absolute"
      left={16}
      top={16}
      display="flex"
      alignItems="center"
    >
      <Box
        component="img"
        src="/images/card/wire.png"
        alt="wire card"
        width={100}
        height={150}
        sx={{ mr: "10px" }}
      />
      <Typography variant="h4" fontWeight="bold">
        x {count}
      </Typography>
    </Box>
  );
};

export default WireCounter;
