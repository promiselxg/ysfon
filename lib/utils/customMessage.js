const { NextResponse } = require("next/server");

export const customMessage = (message, data = {}, status = 200) => {
  return new NextResponse(JSON.stringify({ message, ...data }), { status });
};
