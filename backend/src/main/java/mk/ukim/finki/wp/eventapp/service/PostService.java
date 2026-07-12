package mk.ukim.finki.wp.eventapp.service;

import mk.ukim.finki.wp.eventapp.model.Artist;
import mk.ukim.finki.wp.eventapp.model.KadevecerSyncDTO;
import mk.ukim.finki.wp.eventapp.model.Post;
import mk.ukim.finki.wp.eventapp.model.ScrapedDataDTO;

import java.util.List;
import java.util.Optional;

public interface PostService {
    void processScrapedData(List<ScrapedDataDTO> scrapedDataDTO);

    List<Post> getScrapedData();

    List<Post> getScrapedDataByBarName(String barName);

    void processKadevecerSync(KadevecerSyncDTO syncDTO);

    List<Artist> getArtists();

    Post createManualEvent(KadevecerSyncDTO.EventDTO eventDTO);

    Optional<Post> getEventById(Long id);

    boolean deleteEvent(Long id);
}
