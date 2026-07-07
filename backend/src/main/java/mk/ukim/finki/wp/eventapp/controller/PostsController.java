package mk.ukim.finki.wp.eventapp.controller;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.wp.eventapp.model.Artist;
import mk.ukim.finki.wp.eventapp.model.KadevecerSyncDTO;
import mk.ukim.finki.wp.eventapp.model.Post;
import mk.ukim.finki.wp.eventapp.model.ScrapedDataDTO;
import mk.ukim.finki.wp.eventapp.service.PostService;
import mk.ukim.finki.wp.eventapp.service.PostServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PostsController {
    private final PostService postService;

    @Value("${eventapp.admin.token}")
    private String adminToken;

    @PostMapping("/events")
    public void sendToDatabase(@RequestBody List<ScrapedDataDTO> scrapedDataDTO) {
        postService.processScrapedData(scrapedDataDTO);
    }

    @GetMapping("/events/all")
    public List<Post> getScrapedData(){
        return postService.getScrapedData();
    }

    @GetMapping("/events/barName")
    public List<Post> getScrapedDataByBarName(@RequestParam String barName){
        System.out.println(barName);
        return postService.getScrapedDataByBarName(barName);
    }

    @PostMapping("/kadevecer/sync")
    public void syncKadevecer(@RequestBody KadevecerSyncDTO syncDTO) {
        postService.processKadevecerSync(syncDTO);
    }

    @GetMapping("/artists")
    public List<Artist> getArtists() {
        return postService.getArtists();
    }

    @PostMapping("/admin/events")
    public ResponseEntity<Post> createManualEvent(
            @RequestHeader(value = "X-Admin-Token", required = false) String token,
            @RequestBody KadevecerSyncDTO.EventDTO eventDTO) {
        if (adminToken == null || adminToken.isBlank() || !adminToken.equals(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(postService.createManualEvent(eventDTO));
    }
}
