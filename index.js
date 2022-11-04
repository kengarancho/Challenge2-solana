// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        179, 171, 182,  35, 161, 192, 145,  46, 112, 124, 184,
        110, 193, 180, 172, 217, 245, 184,  44,  82, 122,  88,
        234, 134, 177, 100,  52, 179, 127, 199, 233, 251, 209,
        131, 190, 147, 230, 192,   6,  61,   0, 130, 164,  81,
        168, 103,  41,  81, 158, 225,  97,  14, 207,  84, 241,
        213, 198,  27,  39, 122,  36, 173,  12,  47
      ]          
);

let sender = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
const fromPublicKey = new PublicKey(sender._keypair.publicKey).toString();
const fromPrivateKey = sender._keypair.secretKey;

let receiver = Keypair.generate();
const toPublicKey = new PublicKey(receiver._keypair.publicKey).toString();
const toPrivateKey = receiver._keypair.secretKey;

const getWalletBalance = async (newpair) => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        // console.log("Connection object is:", connection);

        // Make a wallet (keypair) from privateKey and get its balance
        const myWallet = await Keypair.fromSecretKey(newpair.secretKey);
        const walletBalance = await connection.getBalance(
            new PublicKey(newpair.publicKey)
        );
        console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }
};

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    const from = sender;

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = receiver;

    await getWalletBalance(from);
    await getWalletBalance(to);

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    await getWalletBalance(from);
    await getWalletBalance(to);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: (2 * LAMPORTS_PER_SOL) / 2
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    await getWalletBalance(from);
    await getWalletBalance(to);
};


transferSol();
