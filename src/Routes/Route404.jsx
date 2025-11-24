import { TextureDatabase } from "../Data/Textures/TextureDatabase";

function Route404() {
    return (
        <div>
            <p>The page you are looking for does not exist.</p>
            <img src={TextureDatabase.PageNotFoundKirino} alt="Page Not Found" />
        </div>
    );
}

export default Route404;