export default async (req, res) => {
    res.setHeader('cache-control', `s-maxage=3600`);
    res.json({
        version: process.env.DASHPUB_BUILD_ID || 'dev',
    });
};
