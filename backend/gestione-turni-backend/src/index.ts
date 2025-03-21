const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

const preflightResponse = new Response(null, { 
    headers: corsHeaders, 
    status: 204 
});


interface PayloadJWT {
    sub: number;
    username: string;
    role: 'manager' | 'dipendente';
    iat: number;
    exp: number;
}

async function generaJWT(user: any, secret: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: PayloadJWT = {
        sub: user.id,
        username: user.username,
        role: user.is_manager ? 'manager' : 'dipendente',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
    };

    const encoder = new TextEncoder();
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );
    
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return `${encodedHeader}.${encodedPayload}.${signatureB64}`;
}

async function verificaJWT(token: string, secret: string): Promise<PayloadJWT> {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    const encoder = new TextEncoder();
    
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const signatureBuffer = Uint8Array.from(
        atob(signature.replace(/-/g, '+').replace(/_/g, '/')), 
        c => c.charCodeAt(0)
    );
    
    const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBuffer,
        encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!isValid) throw new Error('Firma non valida');
    
    const payload: PayloadJWT = JSON.parse(atob(encodedPayload));
    if (payload.exp < Date.now() / 1000) throw new Error('Token scaduto');
    
    return payload;
}


async function verificaAutenticazione(request: Request, env: any, url: URL): Promise<Response | null> {
    if (url.pathname === "/login" || url.pathname === "/register") return null;
    
    const headerAuth = request.headers.get("Authorization");
    if (!headerAuth?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Token mancante" }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        const token = headerAuth.split(" ")[1];
        await verificaJWT(token, env.JWT_SECRET);
        return null;
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : "Token non valido"
        }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function verificaPermessiManager(request: Request, env: any): Promise<Response | null> {
    const token = request.headers.get("Authorization")?.split(" ")[1] || "";
    const { role } = await verificaJWT(token, env.JWT_SECRET);
    
    return role !== 'manager'
        ? new Response(JSON.stringify({ error: "Accesso riservato ai manager" }), 
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        : null;
}


async function handleLogin(request: Request, env: any) {
    try {
        const body = await request.json() as { username: string; password: string };
        console.log("Tentativo login per:", body.username);
        
        const user = await env.DB.prepare(
            "SELECT id, username, is_manager FROM users WHERE username = ? AND password = ?"
        ).bind(body.username, body.password).first();

        console.log("Risultato query:", user);

        if (!user) {
            console.log("Credenziali errate per:", body.username);
            return new Response(JSON.stringify({ error: "Credenziali errate" }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const token = await generaJWT(user, env.JWT_SECRET);
        console.log("Login riuscito per:", user.username);
        
        return new Response(JSON.stringify({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.is_manager ? "manager" : "dipendente"
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Errore durante il login:", error);
        return new Response(JSON.stringify({ error: "Errore interno" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function handleRegister(request: Request, env: any) {
    try {
        const body = await request.json() as { username: string; password: string; is_manager: boolean };
        const existingUser = await env.DB.prepare(
            "SELECT id FROM users WHERE username = ?"
        ).bind(body.username).first();

        if (existingUser) {
            return new Response(JSON.stringify({ error: "Username già esistente" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        await env.DB.prepare(
            "INSERT INTO users (username, password, is_manager) VALUES (?, ?, ?)"
        ).bind(body.username, body.password, body.is_manager ? 1 : 0).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Errore interno" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function getUsers(env: any) {
    try {
        const users = await env.DB.prepare("SELECT id, username FROM users").all();
        return new Response(JSON.stringify(users.results), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Errore database" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function gestisciTurni(request: Request, env: any, url: URL) {
    try {
        switch (request.method) {
            case 'GET':
                const turni = await env.DB.prepare(
                    "SELECT t.id, t.date, t.start_time, t.end_time, u.username " +
                    "FROM turni t JOIN users u ON t.user_id = u.id"
                ).all();
                return new Response(JSON.stringify(turni.results), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            case 'POST':
                const permessoPost = await verificaPermessiManager(request, env);
                if (permessoPost) return permessoPost;

                const body = await request.json() as { user_id: number; date: string; start_time: string; end_time: string };
                await env.DB.prepare(
                    "INSERT INTO turni (user_id, date, start_time, end_time) VALUES (?, ?, ?, ?)"
                ).bind(body.user_id, body.date, body.start_time, body.end_time).run();
                
                return new Response(JSON.stringify({ success: true }), {
                    status: 201,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            default:
                return new Response('Metodo non consentito', { status: 405, headers: corsHeaders });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: "Errore interno del server" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}


export default {
    async fetch(request: Request, env: any) {
        const url = new URL(request.url);
        
        if (request.method === 'OPTIONS') return preflightResponse;

        try {
            const authCheck = await verificaAutenticazione(request, env, url);
            if (authCheck) return authCheck;

            switch (url.pathname) {
                case '/login':
                    return request.method === 'POST' 
                        ? handleLogin(request, env) 
                        : new Response('Metodo non supportato', { status: 405, headers: corsHeaders });
                
                case '/register':
                    return request.method === 'POST' 
                        ? handleRegister(request, env) 
                        : new Response('Metodo non supportato', { status: 405, headers: corsHeaders });
                
                case '/turni':
                    return gestisciTurni(request, env, url);
                
                case '/users':
                    return request.method === 'GET' 
                        ? getUsers(env) 
                        : new Response('Metodo non supportato', { status: 405, headers: corsHeaders });
                
                default:
                    return new Response('Endpoint non trovato', { status: 404, headers: corsHeaders });
            }
        } catch (error) {
            return new Response(JSON.stringify({ error: "Errore interno del server" }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};